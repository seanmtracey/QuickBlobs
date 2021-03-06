# quick-cluster-counts
A Node.js module that counts cluster of pixels in an image. Based on [Gary Short's 'chickens' code](https://github.com/garyshort/chickens)

## Usage

```JavaScript

const quickClusterCounts = require('quick-cluster-counts');

quickClusterCounts( { path : '/path/to/imageFile.jpg'} )
    .then(results => {
        console.log(results);
    })
;

```

### Options (all optional unless otherwise stated)

**path (STRING) [required]**

An absolute path to the file you wish to process.

**invert (BOOLEAN)**

Should the image be inverted before processing? Advisable if image being processed has a light background with dark points.

**neighbourThreshold (Number)**

The maximum distance pixels can be apart in order to be considered neighbors.

**mergeThreshold (Number)**

The maximum allowed distance clusters can be apart for them to be considered for merging.

**noiseThreshold (Number)**

The mininum size a cluster needs lest it be ignored as noise.

### Properties

**numberOfClusters**

The total number of clusters identified

**clusters**

The identified clusters

## Dependencies

You will need either graphicsmagick or imagemagick installed on your system for this module to work.

## Process

So, what actually happens? 

1. The passed image is shrunk down to 128 pixels wide (the height will be proportional to the width)
2. The image is converted from color into a greyscale image
3. The image is inverted (because of the initial use-case, this will be optional later)
4. Every pixel that is less than rgb(128,128,128) is converted to absolute black
5. Every pixel that is greater than rgb(128,128,128) is converted to absolute white.
6. A one dimensional array representing the pixel values of the image is then created
7. These pixels are counted and clustered 
8. Clusters that have less pixels than a set threshold are the removed
9. The number of clusters is returned.

## Why is this useful?

This module was created to researchers in counting the number of cells in a microsope image for UCls [#Learnhack](http://learnhack.it) - a process that is largely manual to date. 

## Is it useful for anything else?
Well, [Gary](https://twitter.com/garyshort) wrote the original algorithm to count the number of chickens in an image. I realised that the same algorithm could be used to count the number of cells in an image taken from a microscope. If you're looking to count bright dots in a dark space (stars in the sky, maybe?) then this might be useful for you.

## Why 'quick'-cluster-counts

It's called 'quick'-cluster-counts because I put it together quickly. It should not be taken as an advertisment for the modules speed 😅