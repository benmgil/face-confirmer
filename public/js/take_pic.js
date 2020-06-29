
class Picture {
  prepareTheCamera() {
    this.video = document.getElementById("video");
    this.canvas = document.getElementById("canvas");
    if (!this.video) {
      setTimeout(() => {
        this.prepareTheCamera();
      }, 1);
    } else {
      let that = this;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            this.video.muted = true;
            this.camera_permission = true;
            this.video.srcObject = stream;
            this.video.play();
          })
          .catch((err) => {
            that.camera_permission = false;
          });
      }
    }
  }

  prepareScreenshot() {
    this.ss_video = document.getElementById("ss_video");
    this.ss_canvas = document.getElementById("ss_canvas");
    if (!this.ss_video) {
      setTimeout(() => {
        this.prepareTheCamera();
      }, 1);
    } else {
      let that = this;
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true })
          .then((stream) => {
            this.ss_video.muted = true;
            this.camera_permission = true;
            this.ss_video.srcObject = stream;
            this.ss_video.play();
          })
          .catch((err) => {
            that.camera_permission = false;
          });
      }
    }
  }

  captureImg() {
    if (this.camera_permission) {
      const context = this.canvas
        .getContext("2d")
        .drawImage(this.video, 0, 0, 640, 480);
      return this.canvas.toDataURL("image/png");
    } else {
      return null;
    }
  }

  captureSS() {
    if (this.camera_permission) {
      const context = this.ss_canvas
        .getContext("2d")
        .drawImage(this.ss_video, 0, 0, 640, 480);
      return this.ss_canvas.toDataURL("image/png");
    } else {
      return null;
    }
  }
}

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

function makeBlob(img_string){
  //var form = document.getElementById("myAwesomeForm");

  var ImageURL = img_string;
  // Split the base64 string in data and contentType
  var block = ImageURL.split(";");
  // Get the content type of the image
  var contentType = block[0].split(":")[1];// In this case "image/gif"
  // get the real base64 content of the file
  var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

  // Convert it to a blob to upload
  var blob = b64toBlob(realData, contentType);
  return blob
}

function postImage(file){

  fetch('https://qyn5eccw3j.execute-api.us-east-1.amazonaws.com/dev/upload/url',
    {
      method: 'POST', 
      headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({'content_type':'image/png'}) 
    }
  )
  .then(response => response.json())
  .then(data => {
    var headers = {'Content-Type': 'image/png'}
    fetch(data.url, {method:'PUT', headers: headers, body: file})
    .then(response2 => {
      if(response2.status == 200){
        fetch('https://qyn5eccw3j.execute-api.us-east-1.amazonaws.com/dev/upload', {
          headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
          },
          method:'POST', body:JSON.stringify({    //Ben/assignment/screenshots/file.png
            'studentId':'bengilman@wustl.edu',
            'assignmentId':'example-assgn',
            'type':'screenshot',
            'key': data.key
          }) 
        })
      }
    })
  })

  //fetch('https://qyn5eccw3j.execute-api.us-east-1.amazonaws.com/dev/upload', {method:'POST', body:{key: 'tmp/j34DMtEAxp3mkvhjko118IIGqyry3qNtJMiQa12P.png'}})
 
  console.log(file)
}

function capture_webcam(screenshotter) {
  var temp_img = screenshotter.captureImg();
  blob = makeBlob(temp_img);
  postImage(blob);
  //var a = document.createElement("a"); 
  //a.href = temp_img;
  //a.download = "Crazy_ben.jpeg";
  console.log(temp_img)
  //document.body.appendChild(a);
  //a.click();
}

function capture_ss(ss) {
  var temp_img = ss.captureSS();
  blob = makeBlob(temp_img);
  postImage(blob);
  //var b = document.createElement("b");
  //b.href = temp_img;
  //b.download = "screenshot.jpeg";
  //document.body.appendChild(b);
  //b.click();
}
 

function capture(ss) {
  capture_webcam(ss);
  capture_ss(ss);
}

var ss = new Picture();
ss.prepareTheCamera();
ss.prepareScreenshot();

//setInterval(capture, 10000, ss);


