<?php

namespace App\Http\Controllers;

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
        $userId = Auth::id();

        $transactions = Transaction::with('category') // ✅ ดึงข้อมูลจากตาราง `categories`
            ->where('user_id', $userId)
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'category_id' => $transaction->category->id ?? null, // ✅ ใช้ category_id
                    'category' => optional($transaction->category)->name ?? 'ไม่ระบุหมวดหมู่', // ✅ ป้องกัน error
                    'icon' => $transaction->category->icon ?? '❓', // ✅ ใช้ icon จาก `categories`
                    'description' => $transaction->description ?? 'ไม่มีรายละเอียด',
                    'amount' => $transaction->amount,
                    'transaction_type' => $transaction->transaction_type,
                    'date' => $transaction->transaction_date,
                    'created_at' => $transaction->created_at,
                ];
            });

        Log::info('📤 ข้อมูลธุรกรรมที่ส่งกลับไป:', $transactions->toArray());

        return response()->json(['transactions' => $transactions]);
    }



    /**
     * Store a newly created transaction.
     */
    public function store(Request $request)
    {
        try {
            Log::info("📥 Data received in Backend:", $request->all());

        $validated = $request->validate([
            'category_id' => 'sometimes|integer',
            'category_name' => 'required|string',
            'category_icon' => 'required|string',
            'amount' => 'required|numeric',
            'transaction_type' => 'required|string',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        Log::info("✅ Validated Data:", $validated);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // ✅ ตรวจสอบว่าหมวดหมู่มีอยู่แล้วหรือไม่
        $category = Category::where('user_id', $userId)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['category_name']))])
            ->where('type', $validated['transaction_type'])
            ->first();

            if (!$category) {
                // ✅ ถ้าไม่มีหมวดหมู่ → สร้างใหม่ พร้อมไอคอน
                $category = Category::create([
                    'user_id' => $userId,
                    'name' => trim($validated['category_name']),
                    'type' => $validated['transaction_type'],
                    'icon' => $validated['category_icon'], // ✅ ต้องบันทึก icon ตรงนี้
                ]);
                Log::info("🆕 New Category Created:", ['category' => $category->toArray()]);
            } else {
                // ✅ ถ้ามีอยู่แล้ว และไม่มี icon → อัปเดต
                if (!$category->icon) {
                    $category->update(['icon' => $validated['category_icon']]);
                    Log::info("🔄 Category Updated:", ['id' => $category->id, 'icon' => $validated['category_icon']]);
                }
            }


        // ✅ เช็คว่า `$category` ถูกกำหนดค่าแน่นอน
        if (!$category) {
            Log::error("❌ Error: Category is still undefined!");
            return response()->json(['success' => false, 'message' => 'Category could not be determined'], 500);
        }

        Log::info("📌 Final Category Data:", ['id' => $category->id, 'icon' => $category->icon]);

        // ✅ บันทึกธุรกรรม
        $transaction = Transaction::create([
            'user_id' => $userId,
            'category_id' => $category->id,
            'category_name' => $category->name,
            'category_icon' => $category->icon,
            'amount' => $validated['amount'],
            'transaction_type' => $validated['transaction_type'],
            'description' => $validated['description'],
            'transaction_date' => $validated['transaction_date'],
        ]);

            // ✅ **อัปเดตงบประมาณ**
            Log::info("📝 Budget Update Data", [
                'user_id' => $userId,
                'category_id' => $category->id,
                'amount' => $validated['amount'],
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->endOfMonth(),
            ]);

            // ✅ **เช็คว่ามีงบประมาณของ user นี้หรือไม่**
            $budget = Budget::where('user_id', $userId)->first();

            if ($budget) {
                // ✅ ถ้ามีงบประมาณ → อัปเดตยอดเงิน
                if ($validated['transaction_type'] === 'income') {
                    $budget->amount += abs($validated['amount']);
                } else {
                    $budget->amount -= abs($validated['amount']);
                }
                $budget->save();
            } else {
                // ✅ ถ้าไม่มี `user_id` ใน `budgets` → สร้างใหม่
                $budget = Budget::create([
                    'user_id' => $userId,
                    'category_id' => $category->id,
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
            ]);

        } catch (\Exception $e) {
            Log::error("❌ Error: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json($transaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // 🔍 ค้นหาธุรกรรมที่ต้องการแก้ไข
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return response()->json(['message' => 'ไม่พบธุรกรรม'], 404);
        }

        // ✅ ตรวจสอบและอัปเดตข้อมูล
        $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
        ]);

        Log::info('📥 อัปเดตธุรกรรม: ', $request->all());
        // ✅ ตรวจสอบและบันทึกข้อมูลทั้งหมดในครั้งเดียว
        $transaction->description = $request->description;
        $transaction->amount = $request->amount;
        $transaction->category_id = $request->category_id; // ✅ ย้ายมาก่อน save()
        $transaction->save(); // ✅ บันทึกครั้งเดียว

        Log::info('✅ ข้อมูลธุรกรรมที่ถูกอัปเดต:', $transaction->toArray()); // ✅ ตรวจสอบค่าหลังบันทึก
        return response()->json(['message' => 'อัปเดตรายการสำเร็จ', 'transaction' => $transaction]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //ลบธุรกรรม
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return response()->json(['message' => 'ไม่พบธุรกรรม'], 404);
        }

        $transaction->delete();
        return response()->json(['message' => 'ลบธุรกรรมสำเร็จ']);
    }
}
