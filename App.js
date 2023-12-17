
import React from 'react';
import { StyleSheet, Text, View,FlatList,
  ActivityIndicator,
  Image ,Button} from 'react-native';
import {useState,useEffect} from "react";



var ATR = require('technicalindicators').ATR
var MFI = require('technicalindicators').MFI
var TI = require('technicalindicators');
const SMA = require('technicalindicators').SMA;
import pairs from "./src/config/pairs"

export default   function App() {
    const [symbolData, setSymbolData] = useState([]);
    let limit =300;
    console.log(pairs)

    // pairs.pairs.length=10;
    const symbols = pairs.pairs;
  


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
        // console.log("trendIdentifier",trendIdentifier);

        return trendIdentifier;
    }

    function calculateHL2(highPrices, lowPrices) {
      return highPrices.map((high, i) => (parseFloat(high) + parseFloat(lowPrices[i])) / 2);
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
        const highLowDiff = parseFloat(highPrices[i]) - parseFloat(lowPrices[i]);
        const highCloseDiff = Math.abs(parseFloat(highPrices[i]) - parseFloat(closePrices[i - 1]));
        const lowCloseDiff = Math.abs(parseFloat(lowPrices[i]) - parseFloat(closePrices[i - 1]));
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









  useEffect(() => {
        //   console.log("useEffect")

        const fetchData = async () => {
          let newData = [];  
          let count=0
          
          


          for (const symbol of symbols) {
          try{

          
            fetch('https://api1.binance.com/api/v3/klines?symbol='+symbol+'&limit='+limit+'&interval=1d',   {
              method: "GET"})
            .then((response) => response.json())
            .then((responseData) =>
            {  
              console.log("responseData",responseData)

                        

              let priceData = [
              
              ];
              let timeWithZone=[]
              const highPrices = [/* array of high prices */];
              const lowPrices = [/* array of low prices */];
              const closePrices = [/* array of close prices */];
              
              for(let i=0;i<responseData.length;i++){
                // console.log("responseData",responseData);
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
              const atrLength = 10;
              const multiplier = 3;
              const superTrendValues = calculateSuperTrend(timeWithZone,highPrices, lowPrices, closePrices, multiplier, atrLength);

              // console.log(superTrendValues);
              let symbol_Individual_data={};
              symbol_Individual_data.pair=symbol;
              symbol_Individual_data.signal=superTrendValues[superTrendValues.length-1][1];
              console.log(symbol_Individual_data);
              newData.push(symbol_Individual_data);
              count++;
              if(count==symbols.length-1){
                console.log("newData",newData)
                setSymbolData(newData);
              }
                

                        
            }).catch((error)=>{
              console.log("error",error)
            })

          }catch(e){
            console.log(e)
          }  

          }
          
          
        }  

        fetchData()


        return () => {
         console.log('Cleanup!');
        };
  
  },[]);
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Favorite Pairs </Text>
      
      {symbolData.map(symbol => (
        <Text key={symbol.pair}>
          {
            symbol.pair+"   "
          }

          {
            symbol.signal
          }
        </Text>
      ))}

  
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
