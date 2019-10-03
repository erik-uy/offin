<template>
  <v-container bg fill-height grid-list-md text-xs-center>
    home
  </v-container>
</template>

<script>
import axios from 'axios';
import VueJsonPretty from 'vue-json-pretty'

export default {
  components: {
    VueJsonPretty
  },
  name: 'home',
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

    },
}
</script>

