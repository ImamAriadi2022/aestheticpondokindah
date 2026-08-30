<?php

namespace App\Services\Shared\WhatsApp;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZestaWhatsAppService
{
    /**
     * Get Zesta API Key from config.
     */
    protected static function getApiKey(): ?string
    {
        return config('services.zesta.api_key');
    }

    /**
     * Get Zesta Base URL.
     */
    protected static function getBaseUrl(): string
    {
        return rtrim(config('services.zesta.base_url', 'https://api.zesta.id'), '/');
    }

    /**
     * Format and normalize phone number into standard international WhatsApp format (+62...)
     */
    public static function normalizePhone(string $rawPhone): string
    {
        $digits = preg_replace('/[^\d]/', '', $rawPhone);
        if (empty($digits)) {
            return '';
        }

        if (str_starts_with($digits, '62')) {
            return '+' . $digits;
        }

        if (str_starts_with($digits, '0')) {
            return '+62' . substr($digits, 1);
        }

        return '+62' . $digits;
    }

    /**
     * Send raw payload to Zesta Send Message API.
     * Endpoint: POST https://api.zesta.id/api/external/messages/send
     *
     * @param array $payload
     * @return array
     */
    public static function sendRaw(array $payload): array
    {
        $apiKey = self::getApiKey();

        if (empty($apiKey)) {
            Log::warning('[ZestaWhatsApp] API Key is not configured in services.zesta.api_key / ZESTA_API_KEY');
            return [
                'success' => false,
                'message' => 'Zesta API Key belum dikonfigurasi.',
                'error' => 'MISSING_API_KEY',
            ];
        }

        $url = self::getBaseUrl() . '/api/external/messages/send';

        try {
            $response = Http::withHeaders([
                'X-API-Key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(10)->post($url, $payload);

            $data = $response->json();

            if ($response->successful() && ($data['success'] ?? false)) {
                return [
                    'success' => true,
                    'message' => $data['message'] ?? 'Pesan WhatsApp berhasil dikirim.',
                    'data' => $data['data'] ?? null,
                ];
            }

            $errorMessage = $data['message'] ?? ($data['error'] ?? 'Gagal mengirim pesan melalui Zesta API.');
            Log::warning('[ZestaWhatsApp] Send message failed: ' . $errorMessage, [
                'status' => $response->status(),
                'response' => $data,
            ]);

            return [
                'success' => false,
                'message' => $errorMessage,
                'status' => $response->status(),
                'data' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('[ZestaWhatsApp] Exception during send: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Terjadi kendala jaringan saat menghubungi Zesta WhatsApp API.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send a free-text message.
     *
     * @param string $phoneOrCustomerId Phone number (+62...) or Zesta customerId (cmr_...)
     * @param string $text Message content
     * @param string|null $name Customer name (optional)
     * @param string|null $channelId Specific WhatsApp channel UUID (optional)
     * @param bool $isCustomerId Set true if $phoneOrCustomerId is a Zesta customerId
     * @return array
     */
    public static function sendTextMessage(
        string $phoneOrCustomerId,
        string $text,
        ?string $name = null,
        ?string $channelId = null,
        bool $isCustomerId = false
    ): array {
        $payload = [
            'text' => $text,
        ];

        if ($isCustomerId || str_starts_with($phoneOrCustomerId, 'cmr_')) {
            $payload['customerId'] = $phoneOrCustomerId;
        } else {
            $payload['phone'] = self::normalizePhone($phoneOrCustomerId);
        }

        if (!empty($name)) {
            $payload['name'] = trim($name);
        }

        if (!empty($channelId)) {
            $payload['channelId'] = trim($channelId);
        }

        return self::sendRaw($payload);
    }

    /**
     * Send a template message.
     *
     * @param string $phoneOrCustomerId Phone or customerId
     * @param string $templateId Meta template ID / name
     * @param array $variables Variables array ({{1}}, {{2}}, ...)
     * @param string|null $name Customer name
     * @param array $buttons Dynamic button parameters
     * @param string|null $channelId
     * @param bool $isCustomerId
     * @return array
     */
    public static function sendTemplateMessage(
        string $phoneOrCustomerId,
        string $templateId,
        array $variables = [],
        ?string $name = null,
        array $buttons = [],
        ?string $channelId = null,
        bool $isCustomerId = false
    ): array {
        $payload = [
            'messageTemplateId' => $templateId,
        ];

        if ($isCustomerId || str_starts_with($phoneOrCustomerId, 'cmr_')) {
            $payload['customerId'] = $phoneOrCustomerId;
        } else {
            $payload['phone'] = self::normalizePhone($phoneOrCustomerId);
        }

        if (!empty($name)) {
            $payload['name'] = trim($name);
        }

        if (!empty($variables)) {
            $payload['variables'] = array_values($variables);
        }

        if (!empty($buttons)) {
            $payload['buttons'] = array_values($buttons);
        }

        if (!empty($channelId)) {
            $payload['channelId'] = trim($channelId);
        }

        return self::sendRaw($payload);
    }

    /**
     * Send WhatsApp OTP for phone verification or registration.
     *
     * @param string $phone
     * @param string $otp 6-digit verification code
     * @param string|null $name
     * @return array
     */
    public static function sendOtp(string $phone, string $otp, ?string $name = null): array
    {
        $normalizedPhone = self::normalizePhone($phone);
        $displayName = $name ? trim($name) : 'Pasien';

        $text = "Halo {$displayName},\n\nKode OTP verifikasi Aesthetic Pondok Indah Dental Anda adalah: *{$otp}*\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.";

        return self::sendTextMessage($normalizedPhone, $text, $displayName);
    }
}
