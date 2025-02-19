<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'transactions' => Transaction::orderBy('transaction_date', 'desc')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info("📥 Data received:", $request->all());

            $validated = $request->validate([
                'category_name' => 'required|string|max:255',
                'amount' => 'required|numeric',
                'transaction_type' => 'required|in:income,expense',
                'description' => 'nullable|string',
                'transaction_date' => 'required|date',
            ]);

            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            // ✅ ค้นหา category_id จาก category_name ถ้ายังไม่มีให้สร้างใหม่
            $category = Category::firstOrCreate(
                ['name' => trim($validated['category_name'])],
                ['user_id' => $userId, 'type' => $validated['transaction_type']]
            );

            $category_id = $category->id;

            // ✅ บันทึกธุรกรรมลงตาราง transactions
            $transaction = Transaction::create([
                'user_id' => $userId,
                'category_id' => $category_id, // ✅ ใช้ category_id ที่หาได้
                'amount' => $validated['amount'],
                'transaction_type' => $validated['transaction_type'],
                'description' => $validated['description'] ?? null,
                'transaction_date' => $validated['transaction_date'],
            ]);

            // ✅ ตรวจสอบว่ามี Budget อยู่หรือไม่
            $budget = Budget::where('user_id', $userId)->first();

            if ($budget) {
                // ✅ ถ้ามีงบประมาณ → อัปเดตยอดเงิน
                if ($validated['transaction_type'] === 'income') {
                    $budget->amount += abs($validated['amount']); // บวกเงินเข้า
                } else {
                    $budget->amount -= abs($validated['amount']); // ลบเงินออก
                }
                $budget->save();
            } else {
                Log::info("✅ Using category_id: " . $category_id);
                // ✅ ถ้าไม่มี Budget → สร้างใหม่
                $budget = Budget::create([
                    'user_id' => $userId,
                    'category_id' => $category_id,
                    'amount' => $validated['transaction_type'] === 'income'
                        ? abs($validated['amount'])
                        : -abs($validated['amount']),
                    'start_date' => now()->startOfMonth(),
                    'end_date' => now()->endOfMonth(),
                ]);
            }

            return response()->json([
                'success' => true,
                'transaction' => $transaction,
                'category' => $category,
                'budget' => $budget,
            ], 201);

        } catch (\Exception $e) {
            Log::error("❌ Error: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id): Response
    {
        $transaction = Transaction::findOrFail($id);
        return Inertia::render('EditTransaction', [
            'transaction' => $transaction
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //แก้ไขข้อมูล อัพเดต
        $transaction = Transaction::findOrFail($id);
        $transaction->update($request->all());

        return response()->json(['message' => 'อัปเดตสำเร็จ']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //ลบข้อมูลธุรกรรม
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json(['message' => 'ลบธุรกรรมสำเร็จ']);
    }
}
