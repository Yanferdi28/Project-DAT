<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserRegistered extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The newly registered user.
     */
    protected User $newUser;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $newUser)
    {
        $this->newUser = $newUser;
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
            ->subject('Pengguna Baru Menunggu Verifikasi - Sistem Arsip DAT')
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Ada pengguna baru yang mendaftar dan menunggu verifikasi.')
            ->line('**Detail Pengguna:**')
            ->line('- Nama: ' . $this->newUser->name)
            ->line('- Email: ' . $this->newUser->email)
            ->line('- Waktu Pendaftaran: ' . $this->newUser->created_at->format('d M Y H:i'))
            ->action('Verifikasi Pengguna', url('/users'))
            ->line('Silakan tinjau dan verifikasi pengguna ini.')
            ->salutation('Salam, Sistem Arsip DAT');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Pengguna baru ' . $this->newUser->name . ' menunggu verifikasi.',
            'user_id' => $this->newUser->id,
            'user_name' => $this->newUser->name,
            'user_email' => $this->newUser->email,
        ];
    }
}
