<?php
/**
 * Helper Utility to Append New Activity Log Entries
 * Aesthetic Pondok Indah Dental Clinic
 */

function appendActivityLog($data) {
    $file = __DIR__ . '/activity_log.json';
    $logs = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

    // Hitung ID berikutnya dari entri terbaru (format act-<n>) agar tidak bentrok
    $nextId = 1;
    foreach ($logs as $log) {
        if (isset($log['id']) && preg_match('/act-(\d+)/', $log['id'], $m)) {
            $nextId = max($nextId, (int)$m[1] + 1);
        }
    }

    $newEntry = [
        'id' => 'act-' . $nextId,
        'date' => $data['date'] ?? date('Y-m-d'),
        'time' => $data['time'] ?? date('H:i'),
        'category' => $data['category'] ?? 'General',
        'type' => $data['type'] ?? 'Feature',
        'feature' => $data['feature'] ?? 'System Update',
        'description' => $data['description'] ?? '',
        'notes' => $data['notes'] ?? '',
        'reason' => $data['reason'] ?? '',
        'files' => $data['files'] ?? [],
        'before_progress' => $data['before_progress'] ?? 0,
        'after_progress' => $data['after_progress'] ?? 0,
        'status' => $data['status'] ?? '🟢 Complete',
        'author' => $data['author'] ?? 'Imam Ariadi'
    ];

    array_unshift($logs, $newEntry);
    
    file_put_contents($file, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $newEntry;
}

// Handle Direct POST API Call
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $body = json_decode(file_get_contents('php://input'), true);
    if ($body) {
        $entry = appendActivityLog($body);
        echo json_encode(['success' => true, 'entry' => $entry]);
        exit;
    }
}
