# Keep everything in the Expo SDK
-keep class expo.** { *; }

# Keep all React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.** { *; }

# Keep all classes with @ReactModule annotation
-keep @interface com.facebook.react.annotations.ReactModule
-keep class com.facebook.react.modules.** { *; }

# Ignore warnings for common libraries
-dontwarn com.facebook.react.**
-dontwarn com.facebook.**
-dontwarn okhttp3.**
-dontwarn javax.annotation.**

# Keep all classes for native modules (if any)
-keep class com.yourpackage.** { *; }

# Prevent removal of class members required for reflection
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# For Firebase, if you're using it
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# For libraries like Glide (image loading), if you're using them
-keep class com.bumptech.glide.** { *; }
-dontwarn com.bumptech.glide.**

# Avoid removing app entry point
-keep public class * extends android.app.Application
