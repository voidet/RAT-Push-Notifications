# RAT-Push-Notifications
Finding RATs is hard. Push notifications for findarat.com.au

# What is this?
This is a script that will run on your computer / server that will check the findarat.com.au website and send your devices push notifications when RATs become available. Setting up is simple for the script, but you will need to follow the below steps which I will fill out in more detail depending on popularity.

# What do I need?
You will need your lat / lng of homebase for you I used https://www.latlong.net/convert-address-to-lat-long.html
Next you will need to sign up for a Pushover account. This is an app you can get from the app stores that you install on your phone, then set up some quick development keys on the web, and you will receive push notifications through this app. This saves the hassle of setting up an app through the Apple and Google app stores awaiting for reviews and rejections when essentially this is just a push notification receiver. From there, the script will check every 5mins findarat.com.au and send push notifications for RATs available (in stock or low stock) in your area.

# Installation

```
cd ~/Desktop
git clone git@github.com:voidet/RAT-Push-Notifications.git
npm i
node rat.js
```

Above are example installation steps. This will fire off a bunch of questions, asking for your:

* lat
* lng
* desired radius
* Pushover.com token
* Pushover.com user key

# Credits
Huge credits go to findarat.com.au - this has been a huge community saver, and if this adds too much to your traffic, I would be happy to set up a cache mirror on my end to move traffic away from you.

# Roadmap
* Only notify of RATs that have no been previously marked in the past 12 hours (let's be honest, they sell out in the past 20mins).
