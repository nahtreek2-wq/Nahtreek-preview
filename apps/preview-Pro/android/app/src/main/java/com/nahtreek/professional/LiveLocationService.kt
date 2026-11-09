package com.nahtreek.professional

import android.app.*
import android.content.Intent
import android.location.*
import android.os.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/** Explicit opt-in, ongoing notification, no token on disk and no automatic restart. */
class LiveLocationService : Service(), LocationListener {
  companion object { @Volatile var running=false; @Volatile var error=""; @Volatile var token="" }
  private val worker=Executors.newSingleThreadExecutor()
  private val sending=AtomicBoolean(false)
  private var last: Location?=null
  private var lastSent=0L
  private lateinit var manager: LocationManager
  override fun onBind(intent: Intent?) = null
  override fun onStartCommand(intent: Intent?, flags:Int, startId:Int):Int {
    if(intent?.action=="STOP") { stopSelf(); return START_NOT_STICKY }
    token=intent?.getStringExtra("token") ?: token
    if(token.isBlank()) { stopSelf(); return START_NOT_STICKY }
    val notifications=getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    if(Build.VERSION.SDK_INT>=26)notifications.createNotificationChannel(NotificationChannel("work_location","Work location sharing",NotificationManager.IMPORTANCE_LOW))
    val stop=PendingIntent.getService(this, 912, Intent(this,LiveLocationService::class.java).setAction("STOP"),PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val launch=PendingIntent.getActivity(this,913,Intent(this,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val builder=if(Build.VERSION.SDK_INT>=26)Notification.Builder(this,"work_location") else Notification.Builder(this)
    val notification=builder.setSmallIcon(android.R.drawable.ic_menu_mylocation).setContentTitle("NAHTREEK work location is on")
      .setContentText("Sharing for nearby jobs and your current visit").setContentIntent(launch).setOngoing(true).addAction(android.R.drawable.ic_menu_close_clear_cancel,"Stop sharing",stop).build()
    try {
      startForeground(912,notification)
      manager=getSystemService(LOCATION_SERVICE) as LocationManager
      manager.removeUpdates(this)
      manager.requestLocationUpdates(LocationManager.GPS_PROVIDER,10000L,0f,this)
      manager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,10000L,0f,this)
      running=true;error=""
    }catch(e:Exception){error="Location sharing could not start. Check precise location permission and GPS.";stopSelf()}
    return START_NOT_STICKY
  }
  override fun onLocationChanged(location:Location){
    if(BuildConfig.BUILD_TYPE=="release" && location.isFromMockProvider){error="Mock location cannot be used for nearby jobs.";return}
    last=location
    if(!running || location.accuracy>100 || System.currentTimeMillis()-location.time>120000 || System.currentTimeMillis()-lastSent<10000 || !sending.compareAndSet(false,true))return
    lastSent=System.currentTimeMillis()
    worker.execute {try {publish(location,true,token)} finally {sending.set(false)}}
  }
  private fun publish(location:Location,online:Boolean,bearer:String){
    var connection:HttpURLConnection?=null
    try{
      val endpoint=BuildConfig.NAHTREEK_API_BASE_URL.trimEnd('/')+"/service-workflow/presence"
      if(!endpoint.startsWith("https://"))throw IllegalStateException("Secure endpoint required")
      connection=URL(endpoint).openConnection() as HttpURLConnection
      connection.requestMethod="POST";connection.connectTimeout=7000;connection.readTimeout=7000;connection.doOutput=true
      connection.setRequestProperty("Authorization","Bearer $bearer");connection.setRequestProperty("Content-Type","application/json")
      val body=JSONObject().put("online",online).put("latitude",location.latitude).put("longitude",location.longitude).put("accuracy",location.accuracy.toDouble()).put("observedAt",Instant.ofEpochMilli(location.time).toString())
      connection.outputStream.use{it.write(body.toString().toByteArray())}
      val status=connection.responseCode
      if(status==401||status==403){error="Session expired. Open NAHTREEK and go online again.";Handler(Looper.getMainLooper()).post{stopSelf()}}
      else if(status==409){error="Location sharing stopped because there is no active service visit.";Handler(Looper.getMainLooper()).post{stopSelf()}}
      else if(status !in 200..299)error="Work location was not accepted. Check availability and GPS in the app."
      else error=""
    }catch(e:Exception){error="Connection interrupted. Your last position will be marked stale."}finally{connection?.disconnect()}
  }
  override fun onDestroy(){
    running=false
    if(::manager.isInitialized)manager.removeUpdates(this)
    val bearer=token;token=""
    last?.let { location -> worker.execute{publish(location,false,bearer)} }
    worker.shutdown(); super.onDestroy()
  }
  override fun onProviderDisabled(provider:String){error="Turn on GPS to keep work location up to date."}
  override fun onProviderEnabled(provider:String){}
  @Deprecated("Deprecated in Java") override fun onStatusChanged(provider:String?,status:Int,extras:Bundle?){}
}
