<?php

namespace App\Jobs;

use App\Models\Report;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Log;

class UpdateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    protected $transactionDate;

    public function __construct($userId, $transactionDate)
    {
        $this->userId = $userId;
        $this->transactionDate = $transactionDate;
    }

    public function handle()
{
    Log::info("🔄 กำลังอัปเดตรายงานสำหรับ User ID: {$this->userId}, วันที่: {$this->transactionDate}");

    $startDate = date('Y-m-01', strtotime($this->transactionDate)); // เริ่มต้นเดือน
    $endDate = date('Y-m-t', strtotime($this->transactionDate)); // สิ้นสุดเดือน

    // ✅ คำนวณรายได้และรายจ่าย
    $totalIncome = Transaction::where('user_id', $this->userId)
        ->whereBetween('transaction_date', [$startDate, $endDate])
        ->where('transaction_type', 'income')
        ->sum('amount');

    $totalExpense = Transaction::where('user_id', $this->userId)
        ->whereBetween('transaction_date', [$startDate, $endDate])
        ->where('transaction_type', 'expense')
        ->sum('amount');

    $balance = $totalIncome - $totalExpense;

    // ✅ อัปเดตรายงานหรือสร้างใหม่หากยังไม่มีข้อมูล
    Report::updateOrCreate(
        [
            'user_id'   => $this->userId,
            'start_date' => $startDate,
            'end_date'   => $endDate,
        ],
        [
            'total_income'  => $totalIncome,
            'total_expense' => $totalExpense,
            'balance'       => $balance,
        ]
    );

    Log::info("✅ อัปเดตรายงานสำเร็จ!");
    }
}

