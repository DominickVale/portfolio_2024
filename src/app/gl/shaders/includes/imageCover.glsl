//https://stackoverflow.com/questions/6565703/math-algorithm-fit-image-to-screen-retain-aspect-ratio/6565988#6565988
vec2 imageCover(vec2 planeSize, vec2 imageSize, vec2 uvCoords) {
    vec2 plane = planeSize;
    vec2 image = imageSize;
    float planeAspectRatio = plane.x / plane.y;
    float imageAspectRatio = image.x / image.y;

    vec2 adjustedSize = planeAspectRatio < imageAspectRatio
        ? vec2(image.x * plane.y / image.y, plane.y)
        : vec2(plane.x, image.y * plane.x / image.x);

    vec2 offset = (planeAspectRatio < imageAspectRatio
        ? vec2((adjustedSize.x - plane.x) / 2.0, 0.0)
        : vec2(0.0, (adjustedSize.y - plane.y) / 2.0)) / adjustedSize;

    return uvCoords * plane / adjustedSize + offset;
}
