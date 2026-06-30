// src/composables/useAuthLockout.js
import { ref, onMounted, onUnmounted } from 'vue';

// Escalating delay by failed-attempt count: 1st none, 2nd 10s, 3rd 20s, 4th 30s, 5th+ 60s.
function delayForAttempt(n) {
  if (n <= 1) return 0;
  if (n >= 5) return 60;
  return (n - 1) * 10; // 2->10, 3->20, 4->30
}

export function useAuthLockout() {
  const failedAttempts = ref(0);
  const isLockedOut = ref(false);
  const countdown = ref(0);

  let timerInterval = null;
  const KEY_UNTIL = 'tasleem_auth_lockout_time';
  const KEY_COUNT = 'tasleem_auth_fail_count';

  const stopTimer = () => { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } };

  // End the current wait, but keep the failure count so the next failure escalates.
  const endLockout = () => { isLockedOut.value = false; countdown.value = 0; localStorage.removeItem(KEY_UNTIL); stopTimer(); };

  const tick = () => {
    timerInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) endLockout();
    }, 1000);
  };

  const startLockout = (seconds) => {
    isLockedOut.value = true;
    countdown.value = seconds;
    localStorage.setItem(KEY_UNTIL, (Date.now() + seconds * 1000).toString());
    stopTimer();
    tick();
  };

  // Call on a failed login.
  const recordFailure = () => {
    failedAttempts.value++;
    localStorage.setItem(KEY_COUNT, String(failedAttempts.value));
    const delay = delayForAttempt(failedAttempts.value);
    if (delay > 0) startLockout(delay); // 1st attempt: no lock
  };

  // Call on a successful login — full reset.
  const recordSuccess = () => {
    failedAttempts.value = 0;
    localStorage.removeItem(KEY_COUNT);
    endLockout();
  };

  // Restore state after a refresh (resume countdown + keep escalation level).
  onMounted(() => {
    failedAttempts.value = parseInt(localStorage.getItem(KEY_COUNT) || '0', 10);
    const untilStr = localStorage.getItem(KEY_UNTIL);
    if (untilStr) {
      const remain = Math.ceil((parseInt(untilStr, 10) - Date.now()) / 1000);
      if (remain > 0) { isLockedOut.value = true; countdown.value = remain; tick(); }
      else localStorage.removeItem(KEY_UNTIL);
    }
  });

  onUnmounted(stopTimer);

  return { failedAttempts, isLockedOut, countdown, recordFailure, recordSuccess };
}
