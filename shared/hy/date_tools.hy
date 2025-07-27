(import [datetime [datetime timezone timedelta]])

(defn time-ago [past &optional [now None]]
  (setv now (or now (.now datetime timezone.utc)))
  (setv delta (- now past))

  (setv seconds (int (.total_seconds delta)))
  (setv minutes (// seconds 60))
  (setv hours (// minutes 60))
  (setv days delta.days)

  (cond
    (< seconds 60)
      (format "{} second{} ago" seconds (if (!= seconds 1) "s" ""))
    (< minutes 60)
      (format "{} minute{} ago" minutes (if (!= minutes 1) "s" ""))
    (< hours 24)
      (format "{} hour{} ago" hours (if (!= hours 1) "s" ""))
    True
      (format "{} day{} ago" days (if (!= days 1) "s" ""))))
