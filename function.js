let YTQuality = 
{
  "0" : "0",
  "1" : "1",
  "2" : "2",
  "3" : "3",
  "low" : 'sddefault',
  "low0" : 'sddefault',
  "low1" : 'sd1',
  "low2" : 'sd2',
  "low3" : 'sd3',
  "medium" : "mqdefault",
  "medium0" : "mqdefault",
  "medium1" : "mq1",
  "medium2" : "mq2",
  "medium3" : "mq3",
  "high" : "hqdefault",
  "high0" : "hqdefault",
  "high1" : "hq1",
  "high2" : "hq2",
  "high3" : "hq3",
  "max" : "maxresdefault",
  "max0" : "maxresdefault",
  "max1" : "maxres1",
  "max2" : "maxres2",
  "max3" : "maxres3"
}

// youtube thumbnail (base)
// quality = empty or : 0, 1, 2, 3, low0, low1, low2, low3, medium0, medium1, medium2, medium3, high0, high1, high2, high3, max0, max1, max2, max3
function get_youtube_thumbnail(url, quality) {
  if (url) {
    var video_id, thumbnail, result;

    result = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/
    );

    video_id = result[1];

    if (video_id) {
      let quality_key = YTQuality[quality];

      if (quality_key == undefined || quality_key == "") {
        quality_key = "sddefault";
      }

      var thumbnail =
        "https://img.youtube.com/vi/" + video_id + "/" + quality_key + ".jpg";
      return thumbnail;
    }
  }
  return false;
 
}

// video thumbnail
async function thumbnail(url, ctime, imgw, imgh) {
  return new Promise((resolve, reject) => {

    var video = document.createElement('video');

    var dataURI;
    video.src = url;
    video.type = "video/mp4";
    video.crossOrigin = "anonymous";

    if (video.duration > ctime)
      ctime = video.duration;

    video.load();
    video.currentTime = ctime;

    video.addEventListener('loadeddata', function (e) {
      createImage();
    }, false);

    function createImage() {
      var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (imgw != 0) {
        canvas.width = imgw;
      }

      if (imgh != 0) {
        canvas.height = imgh;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      dataURI = canvas.toDataURL('image/jpeg');
      resolve(dataURI);
    }
  });
}

let cache = new Map();

window.function = async function (url, ctime, imgw, imgh) {

  url = url.value ?? "";
  ctime = ctime.value; // ?? 0.01;
  imgw = imgw.value ?? 0;
  imgh = imgh.value ?? 0;

  if (url == '')
    return;


  if (
    url.search("https://youtu") > -1 ||
    url.search("https://www.youtu") > -1
  ) {
    let dataURI3 = get_youtube_thumbnail(url, ctime);
    return dataURI3;
  }

  let cacheKey = url + ctime + imgw + imgh;

  ctime = ctime.replace(',','.');
  ctime = parseFloat(ctime);
  if (ctime == 0)
    ctime = 1; //0.01;

  let ret = cache.get(cacheKey);

  if (ret == undefined) {
    let dataURI2 = await thumbnail(url, Math.abs(ctime), imgw, imgh);

    ret = dataURI2;
    cache.set(cacheKey, ret);
  }

  return ret;
}

