export async function triggerNewBookingNotification(pujaName: string, locality: string) {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pujaName,
        locality,
      }),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Push notification trigger error:', error);
    return { success: false, error };
  }
}