# Nahtreek Pro release rules (R8). Library AARs (React Native, Razorpay,
# image picker, Firebase) ship their own consumer rules; keep our bridge
# surface, the foreground location service and the payment SDK reachable
# from JS and reflection.
-keep class com.nahtreek.professional.BuildConfig { *; }
-keep class com.nahtreek.professional.** { *; }
-keep class com.nahtreek.push.** { *; }
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**
# Keep readable stack traces for crash reporting.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
