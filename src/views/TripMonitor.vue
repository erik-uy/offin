<template>
  <v-container bg fill-height grid-list-md text-xs-center>
    <v-layout row wrap align-center>
          <v-flex>



            
            <v-card
              class="mx-auto offin"
              color="#009ed7"
              dark
              max-width="600"
            >
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-btn text class="text-truncate"><span class="text-truncate">Museum Station, Castlereagh St, Stand F asdf asdf asdf asdf asdf asdf</span></v-btn>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-btn text class="float-right" light >Illawarra Rd at Hill St, Marrickville</v-btn>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-divider dark/>

              <v-card-text>
                <v-row align="center">
                  <v-col class="display-3" cols="6">
                    {{ minLeft }} minute(s)
                  </v-col>
                  <v-col class="display-3" cols="6" >
                    <v-card light>
                      <v-row >
                        <v-col align="center">
                          <v-icon size="62px">mdi-bus</v-icon>&nbsp;<span style="vertical-align:middle">{{transportName}}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                    
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-col>
                      Arrives at {{ arrival | moment('h:mm:ss a') }} 
                  </v-col>
                  <v-col>
                    <v-card light>
                      <v-container>
                      <v-chip dark :class="{ 'red': arrivalStatus>0, 'blue':arrivalStatus<0, 'teal':arrivalStatus==0}">
                        {{ arrivalStatusText }}
                      </v-chip> &nbsp;
                      <v-chip :color="occupancyColor[occupancy]" outlined>
                        <v-icon>mdi-account</v-icon>
                      </v-chip> 
                      </v-container>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-progress-linear
                color="grey"
                height="5"
                :value="progress"
                striped
              ></v-progress-linear>
            </v-card>




          </v-flex>
        </v-layout>

    <stop-finder v-bind:shown="departurePicker"></stop-finder>


        <v-btn
          color="red lighten-2"
          dark
          @click="departurePicker=!departurePicker"
        >
          Click Me
        </v-btn>
[[{{departurePicker}}]]


  </v-container>
</template>

<script>
import axios from 'axios';
import VueJsonPretty from 'vue-json-pretty'
import StopFinder from '../components/StopFinder.vue'

export default {
  components: {
    VueJsonPretty,
    StopFinder,
  },
  name: 'tripMonitor',
  data () {
      return {
        departurePicker:false,
        origin:'10111065',
        destination:'220456',
        labels: ['SU', 'MO', 'TU', 'WED', 'TH', 'FR', 'SA'],
        progress:0,
        info: {},
        nextDeparture:{},
        nextLeg:{},
        eta:new Date(0),
        pta:new Date(0),
        arrival:new Date(0),
        now:new Date(),
        transportName:'',
        occupancyColor:{
          EMPTY:'green',
          MANY_SEATS: 'green',
          FEW_SEATS: 'orange',
          STANDING_ROOM:'red',
          CRUSHED_STANDING_ROOM:'red',
          FULL:'red',
          NOT_ACCEPTING_PASSENGERS:'red'
        },
        forecast: [
          { day: 'Tuesday', icon: 'mdi-white-balance-sunny', temp: '24\xB0/12\xB0' },
          { day: 'Wednesday', icon: 'mdi-white-balance-sunny', temp: '22\xB0/14\xB0' },
          { day: 'Thursday', icon: 'mdi-cloud', temp: '25\xB0/15\xB0' },
        ],
      }
    },
    computed :{
      occupancy:function(){
        try{
          return this.nextLeg.origin.properties.occupancy;
        }catch(e){
            return 'Unknown';
        }
      },
      minLeft:function(){
        if (this.arrival.getTime()==0) return 0;
        return  Math.ceil( (this.arrival.getTime()-this.now)/1000/60);
      },
      arrivalStatus:function(){
        return Math.abs((this.pta-this.eta)/1000/60);
      },
      arrivalStatusText:function(){
        let t = this.pta - this.eta /1000/60;
        let astat = this.arrivalStatus;
        if(this.arrivalStatus<0){
          return astat + ' minutes early'
        }else if(this.arrivalStatus>0){
          return astat + ' minutes late'
        }else return 'On time';

      },
      journeys:function(){
        try{
        return this.info.data.journeys;
        }catch(e){return ''};
      },
    },
    timers: {
      refreshProgress:  { time: 1000,   autostart: true,  repeat: true },
      refreshData:      { time: 30000,  autostart: true,   repeat: true }
    }, 

    methods:{
      setNextDeparture:function(){
        try{
          let nextDeparture = 0;
          console.log('this.info.data.journeys.length',this.info.data.journeys.length)
          for (var i=0; i<this.info.data.journeys.length; i++){
            
            try{ 
              this.eta = this.arrival = new Date( (this.info.data.journeys[i].legs[0]).origin.departureTimeEstimated); 
            }catch(e){
              this.arrival = new Date((this.info.data.journeys[i].legs[0]).origin.departureTimePlanned); 
            }
            this.pta = new Date((this.info.data.journeys[i].legs[0]).origin.departureTimePlanned); 

            console.log( this.arrival );

            if ( 
              new Date(this.info.data.journeys[i].legs[0].origin.departureTimeEstimated) > new Date() &&
              this.info.data.journeys[i].legs[0].destination.id == "220456"
            ){
              nextDeparture=i;
              break;
            }
          }
          this.nextDeparture=this.info.data.journeys[nextDeparture];
          console.log(this.nextDeparture);
          
          try{
            this.nextLeg=this.info.data.journeys[0].legs[0];
            this.transportName =  this.nextLeg.transportation.number;
          }catch(e){ this.transportName = 'XXX'  };


          return this.nextDeparture;
        }catch(e){return {}};
      },
      refreshData:function(){
        console.log('refresh data');
        let self = this;
        let now = new Date(), 
          sdate = now.getFullYear() + (now.getMonth()+1).pad(2) +''+ now.getDate().pad(2),
          time= now.getHours().pad(2)+now.getMinutes().pad(2);

        let qry = `/v1/tp/trip?TfNSWTR=true&outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&itdDate=${sdate}&itdTime=${time}&type_origin=any&name_origin=${self.origin}&type_destination=any&name_destination=${self.destination}&calcNumberOfTrips=6&excludedMeans=checkbox&exclMOT_1=1&exclMOT_4=1&exclMOT_7=1&exclMOT_9=1&exclMOT_11=1&version=10.2.1.42`;

        axios.get(
          qry,
          {
            headers:{
              'Authorization' : 'apikey fDHe0e8rguQmXsSYvNn04W4ROqJ8dLt3wIii'
            }
          }
        )
        .then(response => (self.info = response))
        .then(self.setNextDeparture)
        .then(function(){
          self.progress=0;
        });
      },
      refreshProgress:function(){
        let self = this;
        console.log('updating ticker')
         self.now = Date.now();
         if (self.progress<100) self.progress = (self.progress + (100/29) );
      }
    },
    mounted() {
      this.refreshData();
    },
}
</script>

