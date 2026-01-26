<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountVerified extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Akun Anda Telah Diverifikasi - Sistem Arsip DAT')
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Selamat! Akun Anda telah berhasil diverifikasi oleh administrator.')
            ->line('Anda sekarang dapat mengakses semua fitur dalam Sistem Arsip DAT.')
            ->action('Login Sekarang', url('/login'))
            ->line('Terima kasih telah menggunakan Sistem Arsip DAT.')
            ->salutation('Salam, Tim Sistem Arsip DAT');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Akun Anda telah diverifikasi oleh administrator.',
        ];
    }
}
