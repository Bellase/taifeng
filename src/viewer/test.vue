<template>
  <div id="cesiumContainer" ref="viewerDivRef"></div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import * as Cesium from 'cesium'
import axios from "axios";


onMounted(() => {
  const viewer = new Cesium.Viewer('cesiumContainer', {
  })
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(120, 20, 4025692.0)
  });
  let fengquanLayers = [];


  let myEntityCollection = new Cesium.CustomDataSource("initPointsCollection");
  viewer.dataSources.add(myEntityCollection);
  initJJ();
  initPoints();

  // 历史点和线
  function initPoints() {

    axios.get('./taifeng.json')
        .then((response) => {
          let points = response.data.points;
          let lineArr = [];

          points.forEach(element => {
            let color = Cesium.Color.RED
            lineArr.push(Number(element.lng))
            lineArr.push(Number(element.lat))
            if (element.strong == "热带低压") {
              color = Cesium.Color.GREEN
            } else if (element.strong == "热带风暴") {
              color = Cesium.Color.BLUE
            } else if (element.strong == "强热带风暴") {
              color = Cesium.Color.YELLOW
            } else if (element.strong == "台风") {
              color = Cesium.Color.fromCssColorString("#FBC712")
            } else if (element.strong == "强台风") {
              color = Cesium.Color.PLUM
            } else if (element.strong == "超强台风") {
              color = Cesium.Color.RED
            }
            var entity1 = new Cesium.Entity({
              position: Cesium.Cartesian3.fromDegrees(Number(element.lng), Number(element.lat)),
              point: {
                pixelSize: 5,
                color: color
              },
            });
            myEntityCollection.entities.add(entity1);
          });

          viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(lineArr),
              width: 3,
              clampToGround: true,
              material: Cesium.Color.RED,
            }
          });
          initForeast(points[points.length - 1])
          adds(points)
        })
  }


  // 预测
  function initForeast(data) {
    let forecast = data.forecast;

    let colorArr = [
      Cesium.Color.fromCssColorString("#2D12FB"),
      Cesium.Color.fromCssColorString("#15E5E7"),
      Cesium.Color.fromCssColorString("#15E74A"),
      Cesium.Color.fromCssColorString("#E76F15"),
      Cesium.Color.fromCssColorString("#15D9E7"),
    ];
    forecast.forEach((ele, ii) => {

      let lineArr = [];
      ele.forecastpoints.forEach((e) => {
        lineArr.push(Number(e.lng))
        lineArr.push(Number(e.lat))
        var entity1 = new Cesium.Entity({
          position: Cesium.Cartesian3.fromDegrees(Number(e.lng),Number(e.lat)),
          point: {
            pixelSize: 7,
            color: colorArr[ii]
          },
        });
        myEntityCollection.entities.add(entity1);
      })
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(lineArr),
          width: 2,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: colorArr[ii]
          }),
        }
      });
    })

  }




  // 警戒线
  function initJJ() {
    // 24 线
    viewer.entities.add({
      name: '24',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          [127, 34],
          [127, 22],
          [119, 18],
          [119, 11],
          [113, 4.5],
          [105, 0]
        ].flat()),
        width: 2,
        material: Cesium.Color.RED,
        clampToGround: true,
      }
    });

    // 48 线
    viewer.entities.add({
      name: '48',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          [132, 34],
          [132, 22],
          [119, 0],
          [105, 0]
        ].flat()),
        width: 2,
        material: Cesium.Color.YELLOW,
        clampToGround: true,
      }
    });
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(126.129019, 29.104287),
      label: {
        fillColor: Cesium.Color.RED,
        text: '24小时警戒线',
        font: '14pt monospace',
      }
    });
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(132, 20),
      label: {
        fillColor: Cesium.Color.YELLOW,
        text: '48小时警戒线',
        font: '14pt monospace',
      }
    });
  }

  let iii = 0;
  let currentPointObj;
  let tbentity;
  function adds(data) {
    addTB()

    setInterval(function () {
      let kkk = iii * 2
      currentPointObj = {
        lon: Number(data[iii].lng),
        lat:Number(data[iii].lat),
        circle7: {
          radius1: 350 - kkk,
          radius2: 450 - kkk,
          radius3: 400 - kkk,
          radius4: 350 - kkk,
        },
        circle10: {
          radius1: 250 - kkk,
          radius2: 270 - kkk,
          radius3: 250 - kkk,
          radius4: 220 - kkk,
        },
        circle12: {
          radius1: 170 - kkk,
          radius2: 150 - kkk,
          radius3: 150 - kkk,
          radius4: 170 - kkk,
        }
      };
      tbentity.position = Cesium.Cartesian3.fromDegrees(Number(data[iii].lng), Number(data[iii].lat))

      if (iii > 99) {
        iii = 0
      } else {
        iii = iii + 1
      }

      removeTFLayer();
      addTyphoonCircle();
    }, 200);

  }

  function addTB() {
    let div = document.createElement("div");
    let img = document.createElement("img");
    div.appendChild(img);
    img.src = './tf.gif'

    img.onload = () => {
      let rub = new SuperGif({
        gif: img
      })
      rub.load(() => {
        tbentity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(75.166493, 39.9060534),
          billboard: {
            image: new Cesium.CallbackProperty(() => {
              return rub.get_canvas().toDataURL("image/png");
            }, false),
            scale: 0.1,
          },
        });
        resolve(entity);
      });
    };
  }


  function removeTFLayer() {
    let arr = fengquanLayers;
    for (let i = 0; i < arr.length; i++) {
      viewer.entities.remove(arr[i])
    }
    fengquanLayers = [];
  }
  function addTyphoonCircle() {
    const circles = ["circle7", "circle10", "circle12"];
    circles.forEach(item => {
      let en = viewer.entities.add({
        id: `tf_polygon_${item}`,
        name: `tf_polygon_${item}`,
        polygon: {
          hierarchy:
              new Cesium.CallbackProperty(() => {
                let points = [];
                if (currentPointObj[item]) {
                  points = getTyphoonPolygonPoints(currentPointObj, item)
                } else {
                  points = []
                }
                return new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(points));
              }, false),
          material: Cesium.Color.ORANGE.withAlpha(0.05),
          extrudedHeight: 1000,
          outline: true,
          outlineColor: Cesium.Color.ORANGE,
          outlineWidth: 2,
        },
        polyline: {
          positions:
              new Cesium.CallbackProperty(() => {
                let points = [];
                if (currentPointObj[item]) {
                  points = getTyphoonPolygonPoints(currentPointObj, item)
                } else {
                  points = []
                }
                return new Cesium.Cartesian3.fromDegreesArray(points);
              }, false),
          material: Cesium.Color.ORANGE,
          width: 2,
          height: 1000,
        }
      })
      fengquanLayers.push(en)
    })
  }
  // 获取台风圈面的坐标
  function getTyphoonPolygonPoints(pointObj, cNum) {
    let points = []
    let center = [pointObj.lon * 1, pointObj.lat * 1]
    let radiusList = [
      pointObj[cNum]['radius1'],
      pointObj[cNum]['radius2'],
      pointObj[cNum]['radius3'],
      pointObj[cNum]['radius4'],
    ]
    let startAngleList = [0, 90, 180, 270]
    let fx, fy
    startAngleList.forEach((startAngle, index) => {
      let radius = radiusList[index] / 100
      let pointNum = 90
      let endAngle = startAngle + 90
      let sin, cos, x, y, angle
      for (let i = 0; i <= pointNum; i++) {
        angle = startAngle + ((endAngle - startAngle) * i) / pointNum
        sin = Math.sin((angle * Math.PI) / 180)
        cos = Math.cos((angle * Math.PI) / 180)
        // console.log(center)
        x = center[0] + radius * sin
        y = center[1] + radius * cos
        points.push(x, y);
        if (startAngle == 0 && i == 0) {
          fx = x;
          fy = y;
        }
      }
    })
    points.push(fx, fy);
    return points
  }
})


</script>
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
