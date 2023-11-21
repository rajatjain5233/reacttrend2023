import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View,FlatList,
  ActivityIndicator,
  Image ,Button} from 'react-native';
import {useState,useEffect} from "react";


// var Stock = require("stock-technical-indicators");

// const Indicator = Stock.Indicator
// const { Supertrend } = require("stock-technical-indicators/study/Supertrend")
// const newStudyATR = new Indicator(new Supertrend());
// const { Indicator } = require('../../study/index');

// const { Supertrend } = require('../../study/Supertrend');
// const newStudySuperTrend = new Indicator(new Supertrend());
// const calculateSupertrend = newStudySuperTrend.calculate(ATR_DATA, { period: 7, multiplier: 3 });
// console.log(calculateSupertrend);
var ATR = require('technicalindicators').ATR
var MFI = require('technicalindicators').MFI
var TI = require('technicalindicators');
const SMA = require('technicalindicators').SMA;
import { Audio } from 'expo-av';
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';



const BACKGROUND_FETCH_TASK = 'background-fetch';



import * as Notifications from 'expo-notifications';



// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   const now = Date.now();

//   console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);

//   // Be sure to return the successful result type!
//   return BackgroundFetch.Result.NewData;
// });



// function getData(query) {
//   return fetch(`https://api1.binance.com/api/v3/klines?symbol=SOLUSDT&limit=30&interval=15m`)
//     .then(response => response.json());
// }


export default  async function App() {
  const [seconds, setSeconds] = useState(1);
  const [sound, setSound] = React.useState();
  const { status } = await Notifications.requestPermissionsAsync();
  // if (status !== 'granted') {
  //   alert('You need to enable permissions in order to receive notifications');
  //   return;
  // }


  // async function playSound() {
  //   console.log('Loading Sound');
  //   const { sound } = await Audio.Sound.createAsync(
  //     //  require('./assets/bodyguard-cell-phone-576.mp3')
  //   );
  //   setSound(sound);

  //   console.log('Playing Sound');
  //   await sound.playAsync();
  // }
  // const onPressLearnMore = () => {
  //     console.log("anyways not useful");
    
  // };
  


function calculateSuperTrend(time,highPrices, lowPrices, closePrices, multiplier, length) {
  // console.log("calculateSuperTrend",highPrices,lowPrices)
  const hl2Values = calculateHL2(highPrices, lowPrices);
  const atrValues = calculateATR(highPrices, lowPrices, closePrices, length);

  let basicUpperBand = [];
  let basicLowerBand = [];
  let upperBand = [];
  let lowerBand = [];
  let superTrend = [];
  let trendIdentifier=[];

  for (let i = 0; i < closePrices.length; i++) {
    basicUpperBand[i] = hl2Values[i] + multiplier * atrValues[i];
    basicLowerBand[i] = hl2Values[i] - multiplier * atrValues[i];

    upperBand[i] = (i === 0 || basicUpperBand[i] < upperBand[i - 1] || closePrices[i - 1] > upperBand[i - 1]) ?
      basicUpperBand[i] :
      upperBand[i - 1];

    lowerBand[i] = (i === 0 || basicLowerBand[i] > lowerBand[i - 1] || closePrices[i - 1] < lowerBand[i - 1]) ?
      basicLowerBand[i] :
      lowerBand[i - 1];

    const isUpTrend = closePrices[i] > lowerBand[i];

    const trendDirection = (i < length) ? "isDownTrend" :
      (superTrend[i - 1] === upperBand[i - 1]) ?
      (closePrices[i] > upperBand[i] ? "isUpTrend" : "isDownTrend") :
      (closePrices[i] < lowerBand[i] ? "isDownTrend" : "isUpTrend");
    
    let trender=[];
    trender.push(time[i],trendDirection);

    trendIdentifier.push(trender);
    superTrend[i] = (trendDirection === "isUpTrend") ? lowerBand[i] : upperBand[i];
  }
  console.log("trendIdentifier",trendIdentifier);

  return trendIdentifier;
}

function calculateHL2(highPrices, lowPrices) {
  return highPrices.map((high, i) => (high + lowPrices[i]) / 2);
}

function calculateATR(highPrices, lowPrices, closePrices, length) {
  const trValues = calculateTR(highPrices, lowPrices, closePrices);
  const atrValues = [trValues[0]];

  for (let i = 1; i < closePrices.length; i++) {
    atrValues[i] = (atrValues[i - 1] * (length - 1) + trValues[i]) / length;
  }
  

  return atrValues;
}

function calculateTR(highPrices, lowPrices, closePrices) {
  const trValues = [];

  for (let i = 1; i < closePrices.length; i++) {
    const highLowDiff = highPrices[i] - lowPrices[i];
    const highCloseDiff = Math.abs(highPrices[i] - closePrices[i - 1]);
    const lowCloseDiff = Math.abs(lowPrices[i] - closePrices[i - 1]);

    trValues.push(Math.max(highLowDiff, highCloseDiff, lowCloseDiff));
  }

  return trValues;
}




function convertEpochToSpecificTimezone(timeEpoch, offset){
  var d = new Date(timeEpoch);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);  //This converts to UTC 00:00
  var nd = new Date(utc + (3600000*offset));
  return nd.toLocaleString();
}







// // Calculate SuperTrend
// const superTrendValues = calculateSuperTrend(priceData, atrLength, multiplier);

// console.log(superTrendValues); // Output or further processing


  useEffect(() => {
    console.log("useEffect")

    
    
    fetch('https://api1.binance.com/api/v3/klines?symbol=CHRUSDT&limit=300&interval=15m',   {method: "GET"})
          .then((response) => response.json())
          .then((responseData) =>
          {  
            
            

            let priceData = [
             
            ];
            let timeWithZone=[]
            const highPrices = [/* array of high prices */];
            const lowPrices = [/* array of low prices */];
            const closePrices = [/* array of close prices */];
            
            for(let i=0;i<responseData.length;i++){
              console.log("responseData",responseData);
              let timeBy100=parseInt(responseData[i][0]);
              timeWithZone.push(convertEpochToSpecificTimezone(timeBy100,-5))
              let independant_price={};
              independant_price.high=responseData[i][2];
              highPrices.push(parseFloat(responseData[i][2]))
              independant_price.low=responseData[i][3];
              lowPrices.push(parseFloat(responseData[i][3]))
              independant_price.close=responseData[i][4];
              closePrices.push(parseFloat(responseData[i][4]));
              priceData.push(independant_price);
            }











            
            // const multiplier = 1.5;
            // const length = 14;

            const atrLength = 10;
            const multiplier = 3;

            // const calculatedSuperTrend = calculateSuperTrend(priceData, atrLength, multiplier);

            const superTrendValues = calculateSuperTrend(timeWithZone,highPrices, lowPrices, closePrices, multiplier, atrLength);

            // console.log(superTrendValues,responseData);








            


              
                        
          })
  
  },[]);
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Favorite Pairs</Text>
      <Text>Number of seconds is {seconds}</Text>
      <Button onPress={onPressLearnMore} title="Click Me" color="#841584" />
  
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center'
  },
  text: {
    fontSize: 20,
    color: '#101010',
    marginTop: 60,
    fontWeight: '700'
  },
  listItem: {
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row'
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  metaInfo: {
    marginLeft: 10
  },
  title: {
    fontSize: 18,
    width: 200,
    padding: 10
  }
});
