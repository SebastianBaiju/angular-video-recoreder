import { Component, ElementRef, Inject, InjectionToken, ViewChild, Renderer2 } from '@angular/core';
import { PopService } from './src/pop.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('video',{static: true}) video!: ElementRef;
  @ViewChild('videoLive',{static: true}) videoLive!: ElementRef;
  @ViewChild('audio',{static: true}) audio!: ElementRef;
  @ViewChild('popcorn') pop!: ElementRef;
  @ViewChild('tooltip') tool!: ElementRef;
  @ViewChild('popcorn1') pop1!: ElementRef;
  @ViewChild('tooltip2') tool1!: ElementRef;
  constructor(private _render2: Renderer2) {}
  public  captureStream!: MediaStream | void | any ;
  public  videoStream!: MediaStream | void | any ;
  public  recorder!: MediaRecorder ;
  public  recordedData: Blob[] = [];
  title = 'mic';
 async checkMicrophone(){
 await navigator.mediaDevices.getUserMedia({ audio: true , video: false })
      .then(  async (stream) => {
        alert('Mic Is Connected');
        this.captureStream = await stream

      }).catch(() => {
        alert('Mic Is Not Connected');

      });
   }
 stopMicrophone(){
    this.captureStream.getTracks().forEach((track:MediaStreamTrack) => {
      track.stop();
    });
}
async checkVideo(){
  await navigator.mediaDevices.getUserMedia({ audio: true , video: true })
       .then(  async (stream) => {
        const options = {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000,
          mimeType: "video/webm",
        };
        this.videoStream = stream;
        this.recorder =  new MediaRecorder(stream, options);
        this.recorder.ondataavailable = (event) => {
    /* add the data to the recordedDataArray */
    this.recordedData.push(event.data)
}
        const video = this.videoLive.nativeElement;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
        this.recorder.start()
      //   setInterval(() => {
      //     this.recorder.requestData()
      // }, 1000)
       }).catch((e) => {
        console.log(e);
         alert('Mic Is Not Connected');
       });
    }
  stopVideo(){


    this.recorder.stop();
    this.recorder.onstop = () => {
      const blob =   new Blob(this.recordedData , {type: "video/webm"})
      console.log(blob, this.recordedData )
      this.startVideoStop( URL.createObjectURL(blob));
    }
  console.log(this.recorder)
  const video = this.videoLive.nativeElement;
    video.onloadedmetadata = () => {
      video.stop();
    };
     this.videoStream.getTracks().forEach((track:MediaStreamTrack) => {
       track.stop();
     });
 }
 startVideo() {

  const video = this.video.nativeElement;
  video.srcObject = this.recorder.stream;
  video.onloadedmetadata = () => {
    video.play();
  };
 }

 startVideoStop(data?: string) {

  const video = this.video.nativeElement;
  video.src = data ;
  video.onloadedmetadata = () => {
    video.play();
  };
 }
 startAudio() {
  const audio = this.audio.nativeElement;
  audio.srcObject =  this.videoStream;
  audio.onloadedmetadata = () => {
    audio.play();
  };
 }



 ngAfterViewInit() {
//  new PopService().createPopper(this.pop.nativeElement,this.tool.nativeElement)
//  new PopService().createPopper(this.pop1.nativeElement,this.tool1.nativeElement)

//  const value = new PopService().getBoundingClientRect(
//   this.pop1.nativeElement
// );
// const value2 = new PopService().getBoundingClientRect(
//   this.pop.nativeElement
// );
// const value3 = new PopService().getCompositeRect(
//   this.pop.nativeElement,document.documentElement,false
// );
// const element = this._render2.createElement('span');
// this._render2.addClass(element, 'ovelay');
// this._render2.setStyle(element, 'transform',`translate(${value3.x}px,${value3.y}px)`);
// this._render2.setStyle(element, 'width',`${value3.width}px`);
// this._render2.setStyle(element, 'height',`${value3.height}px`);
// this._render2.appendChild(document.body,element);
//  console.log(value, value2, value3)

}
}
