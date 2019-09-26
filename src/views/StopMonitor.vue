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
                  <v-list-item-title class="headline">Museum Station, Castlereagh St, Stand F</v-list-item-title>
                  <v-list-item-subtitle>Illawarra Rd at Hill St, Marrickville</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-card-text>
                <v-row align="center">
                  <v-col class="display-3" cols="6">
                    {{ minLeft }} minutes
                  </v-col>
                  <v-col class="display-3" cols="6" >

                    <v-card light>
                      <v-row >
                        <v-col align="center">
                          <v-icon size="62px">mdi-bus</v-icon> 423 
                        </v-col>
                      </v-row>
                    </v-card>
                    
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-subheader>Arrives at {{ arrival | moment('h:mm:ss a') }} [{{ arrivalStatusText }}]</v-subheader>
                </v-row>
              </v-card-text>

              <v-progress-linear
                color="grey"
                height="10"
                value="78"
                striped
              ></v-progress-linear>
              <v-divider></v-divider>

              <v-card-actions>

                <v-expansion-panels light>
                    <v-expansion-panel>
                      <v-expansion-panel-header>Current Location</v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-list class="transparent" collapse>
                          <v-list-item
                            v-for="item in forecast"
                            :key="item.day"
                          >
                            <v-list-item-title>{{ item.day }}</v-list-item-title>

                            <v-list-item-icon>
                              <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-icon>

                            <v-list-item-subtitle class="text-right">
                              {{ item.temp }}
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                        <vue-json-pretty :data="nextDeparture"></vue-json-pretty>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
  </v-container>
</template>

<script>
import axios from 'axios';
import VueJsonPretty from 'vue-json-pretty'

export default {
  components: {
    VueJsonPretty
  },
  name: 'tripMonitor',
  data () {
      return {
        labels: ['SU', 'MO', 'TU', 'WED', 'TH', 'FR', 'SA'],
        info: {},
        nextDeparture:{},
        eta:new Date(0),
        pta:new Date(0),
        arrival:new Date(0),
        now:new Date(),
        transportName:'',
        forecast: [
          { day: 'Tuesday', icon: 'mdi-white-balance-sunny', temp: '24\xB0/12\xB0' },
          { day: 'Wednesday', icon: 'mdi-white-balance-sunny', temp: '22\xB0/14\xB0' },
          { day: 'Thursday', icon: 'mdi-cloud', temp: '25\xB0/15\xB0' },
        ],
      }
    },
    computed :{
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

            if ( new Date(this.info.data.journeys[i].legs[0].origin.departureTimeEstimated) > new Date()){
              nextDeparture=i;
              break;
            }
          }
          this.nextDeparture=this.info.data.journeys[nextDeparture];
          console.log(this.nextDeparture);
          
          try{
            this.transportName =  this.info.data.journeys[0].legs[0].transportation.number;
          }catch(e){ this.transportName = 'XXX'  };


          return this.nextDeparture;
        }catch(e){return {}};
      },
    },
    mounted() {
      function load(self){
        console.log(self);
        let now = new Date(), 
          sdate = now.getFullYear() + (now.getMonth()+1).pad(2) +''+ now.getDate().pad(2),
          time= now.getHours().pad(2)+now.getMinutes().pad(2);

        let qry = `/v1/tp/trip?TfNSWTR=true&outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&itdDate=${sdate}&itdTime=${time}&type_origin=any&name_origin=10111065&type_destination=any&name_destination=10122537&calcNumberOfTrips=6&excludedMeans=checkbox&exclMOT_1=1&exclMOT_4=1&exclMOT_7=1&exclMOT_9=1&exclMOT_11=1&version=10.2.1.42`;

        axios.get(
          qry,
          {
            headers:{
              'Authorization' : 'apikey fDHe0e8rguQmXsSYvNn04W4ROqJ8dLt3wIii'
            }
          }
        )
        .then(response => (self.info = response))
        .then(self.setNextDeparture);
      }
      

      var self = this;
      load(self);
      setInterval(function () {
         console.log('updating ticker')
         self.now = Date.now();
      }, 6000);

      setInterval(function () {
         load(self)
      }, 30000)
    },
}
</script>

