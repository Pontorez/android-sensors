#!/bin/sh
ANDROID_HOME=/opt/android-sdk
PATH=${PATH}:$ANDROID_HOME/tools

#cordova clean
cordova build --release -- --keystore="/opt/android-keys/1.jks" --storePassword=11111111 --alias=a
