# Nahtreek release rules (R8). Library AARs (React Native, Razorpay, image
# picker, Firebase) ship their own consumer rules; keep our bridge surface
# and the payment SDK reachable from JS and reflection.
-keep class com.nahtreek.client.BuildConfig { *; }
-keep class com.nahtreek.client.** { *; }
-keep class com.nahtreek.push.** { *; }
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**
# Keep readable stack traces for crash reporting.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
