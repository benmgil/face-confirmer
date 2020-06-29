var correct = 0;
var incorrect = 0;
var unknown = 0;
var total = 0;
$(document).ready(function () {
  async function face(imgID) {
    const MODEL_URL = "/models";

    total++;
    unknown++;

    var is_unknown = false;

    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);

    const img = document.getElementById(imgID);
    let fullFaceDescriptions = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const canvas = $("#reflay").get(0);
    faceapi.matchDimensions(canvas, img);

    fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions, img);
    faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
    //faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);

    var con = canvas.getContext("2d");
    var imgr = new Image();
    imgr.src = "img/Crazy_ben.jpeg";

    imgr.onload = () => {
      con.drawImage(
        imgr,
        (dx = 471.27335262298584),
        (dy = 366.8473286212282 - 4),
        (dw = 101.75236415863037),
        (dh = 40)
      );
    };
    //485.00318117886485,  421.0191735548258
    //console.log(fullFaceDescriptions[0].landmarks);

    const labels = ["Sam"];

    const labeledFaceDescriptors = await Promise.all(
      labels.map(async (label) => {
        // fetch image data from urls and convert blob to HTMLImage element
        const imgUrl = `img/${label}.jpg`;
        const img = await faceapi.fetchImage(imgUrl);

        // detect the face with the highest score in the image and compute it's landmarks and face descriptor
        const fullFaceDescription = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!fullFaceDescription) {
          throw new Error(`no faces detected for ${label}`);
        } else {
          const faceDescriptors = [fullFaceDescription.descriptor];
          return new faceapi.LabeledFaceDescriptors(label, faceDescriptors);
        }
      })
    );

    const maxDescriptorDistance = 0.6;
    const faceMatcher = new faceapi.FaceMatcher(
      labeledFaceDescriptors,
      maxDescriptorDistance
    );

    const results = fullFaceDescriptions.map((fd) =>
      faceMatcher.findBestMatch(fd.descriptor)
    );

    results.forEach((bestMatch, i) => {
      const box = fullFaceDescriptions[i].detection.box;
      const text = bestMatch.toString();
      const drawBox = new faceapi.draw.DrawBox(box, { label: text });
      drawBox.draw(canvas);

      if (bestMatch.toString().indexOf("Sam") != -1) {
        correct++;
        unknown--;
      } else if (bestMatch.toString().indexOf("unknown") != -1) {
        incorrect++;
        unknown--;
      }
      console.log(correct);
    });
  }

  async function getData() {
    for (var i = 0; i < 3; i++) {
      await face("refimg" + (i + 1));
    }
  }

  async function start() {
    await getData();
    console.log("CORRECT: " + parseFloat(correct) / parseFloat(total));
    console.log("INCORRECT: " + parseFloat(incorrect) / parseFloat(total));
    console.log("UNKNOWN: " + parseFloat(unknown) / parseFloat(total));
  }
  start();
});
