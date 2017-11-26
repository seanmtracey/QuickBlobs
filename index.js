require('dotenv').config();
const debug = require('debug')('quick-cluster-counts');
const fs = require('fs');
const uuid = require('uuid/v4');
const gm = require('gm');
const getPixels = require('get-pixels');
const imageSize = require('image-size');

const TMP_PATH = process.env.TMP_PATH || '/tmp';

// Based on https://github.com/garyshort/chickens
let Clusters = [];

const NeighbourThreshold = 3;
const MergeThreshold = 10;
const NoiseThreshold = 2;

function EuclideanDistanceBetween(p1, p2){
    var a = p1[0] - p2[0]
    var b = p1[1] - p2[1];

    return Math.sqrt( a * a + b * b );
}

function IsCloseTo(p1, p2){
    return EuclideanDistanceBetween(p1, p2) <= NeighbourThreshold;
}

function CalculateVoteOfPoint(p1, p2){
    return 1 / EuclideanDistanceBetween(p1, p2);
}

function CullNoiseClusters(noiseThreshold = NoiseThreshold){
    return Clusters.filter(cluster => cluster.length > noiseThreshold);
}

function ClusterPoint(p){
    let chosenCluster = null;
    let votesCast = 0;

    // If this is the first point, it's the root of the first cluster
    if (Clusters.length == 0) {
        let l = [];
        l.push(p);
        Clusters.push(l);
    } else {
        // Otherwise iterate over all the clusters...
        Clusters.forEach(cluster => {
            // Find all the points within PointThreshold distance

            let votingPoints = cluster.filter(point => {
                return IsCloseTo(point, p)
            });

            // Sum the votes of the voting points
            // let totalVotes = votingPoints.AsParallel().Sum( aPoint => CalculateVoteOfPoint(aPoint, p) );
            let totalVotes = votingPoints.reduce(function (totalSoFar, point) { return CalculateVoteOfPoint(point, p) }, 0);

            // If this is the current max then this is the selected cluster
            if (totalVotes > votesCast) {
                chosenCluster = cluster;
                votesCast = totalVotes;
            }
        });

        // After voting if there's a chosen cluster, add the point
        if (chosenCluster != null){
            chosenCluster.push(p);
        } else {
            // There's no close clusters, so start a new one
            let l = [];
            l.push(p);
            Clusters.push(l);
        }
    }
}

function ClusterAllPoints(dimensions, imageData){

    let clustered = 0;
    const total = dimensions.width * dimensions.height;
    
    for(var zz = 0; zz < imageData.length; zz += 4){

        var x = (zz / 4) % dimensions.width;
        var y = Math.floor((zz / 4) / dimensions.width);

        if(imageData[zz] === 255){
            ClusterPoint([x, y]);
        }

    }

}

module.exports = function(options){

    if(!options.path){
        return Promise.reject();
    }

    const outputPath = `${__dirname}/${uuid()}.jpg`

    return new Promise( (resolve, reject) => {
        
        gm(options.path)
            .resize(128)
            .channel("gray")
            .negative()
            .blackThreshold('50%')
            .whiteThreshold('50%')
            .write(outputPath, function (err) {
                if (err) {
                    reject(err);
                } else {

                    const dimensions = imageSize(outputPath);
                    debug(dimensions);

                    getPixels(outputPath , (err, pixels) => {
                        if(err){
                            reject(err);
                        } else {

                            fs.unlinkSync(outputPath);

                            debug(pixels);
                            ClusterAllPoints(dimensions, pixels.data);
                            CullNoiseClusters(NoiseThreshold);
                            debug(`${Clusters.length} clusters`);
                            resolve(Clusters.length);
                        }
                    })

                }


            })
        ;
    
    });

}