#include <stdlib.h>
#include <stdbool.h>
#include <math.h>
#include <string.h>
#include <emscripten.h>

#define MAX_FACES (65535)
#define POINTS_PER_FACE (3)
#define FLOATS_PER_VERTEX (3)
#define FLOATS_PER_NORMAL (FLOATS_PER_VERTEX)
#define EDGES_PER_FACE (POINTS_PER_FACE)
#define POINTS_PER_EDGE (2)

#ifdef stdout

void printFaceIndices(const int* faceIndices, const int numFaces) {
  for (int i = 0; i < numFaces; i++) {
    const int j = i*POINTS_PER_FACE;
    printf("[%i %i %i] ", faceIndices[j], faceIndices[j+1], faceIndices[j+2]);
  }
  printf("\n");
}

void printFaceNormals(const float* faceNormals, const int numFaces) {
  for (int i = 0; i < numFaces; i++) {
    const int j = i*FLOATS_PER_NORMAL;
    printf("(%f %f %f) ", faceNormals[j], faceNormals[j+1], faceNormals[j+2]);
  }
  printf("\n");
}

void printInts(const int* ints, const int numInts) {
  for (int i = 0; i < numInts; i++) {
    printf("%i ", ints[i]);
  }
  printf("\n");
}

void printEdges(const int* edges, const int numEdges) {
  for (int i = 0; i < numEdges; i++) {
    const int j = i*POINTS_PER_EDGE;
    printf("[%i %i] ", edges[j], edges[j+1]);
  }
  printf("\n");
}
#endif // #ifdef stdout

int indexOfInt(const int* list, const int n, const int v) {
  for (int i = 0; i < n; i++) {
    if (list[i] == v) {
      return i;
    }
  }
  return -1;
}

EMSCRIPTEN_KEEPALIVE
float sqr(const float a) {
  return a*a;
}

float* add(float* out, const float* a, const float* b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

float* sub(float* out, const float* a, const float* b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

float dot(const float* a, const float* b) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

float* multiplyScalar(float* out, const float* a, float s) {
  out[0] = a[0]*s;
  out[1] = a[1]*s;
  out[2] = a[2]*s;
  return out;
}

// out = a + b*s
float* scaleAndAdd(float* out, const float* a, const float* b, const float s) {
  out[0] = a[0] + b[0]*s;
  out[1] = a[1] + b[1]*s;
  out[2] = a[2] + b[2]*s;
  return out;
}

float* normalize(float* out, const float* a) {
  const float len = sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2] );

  if (len > 0.f) {
    out[0] = a[0]/len;
    out[1] = a[1]/len;
    out[2] = a[2]/len;
  } else {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
  }
  return out;
}

float* cross(float* out, const float* a, const float* b) {
  float ax = a[0], ay = a[1], az = a[2];
  float bx = b[0], by = b[1], bz = b[2];

  out[0] = ay*bz - az*by;
  out[1] = az*bx - ax*bz;
  out[2] = ax*by - ay*bx;
  return out;
}

float* setFromCoplanarPoints(float* out, const float* a, const float* b, const float* c) {
  float vbc[] = {0.f,0.f,0.f};
  float vba[] = {0.f,0.f,0,};
  float crossProduct[] = {0.f,0.f,0.f};

  sub(vbc, c, b);
  sub(vba, a, b);
  cross(crossProduct, vbc, vba);
  return normalize(out, crossProduct);
}

bool areCoplanar(const float* a, const float* b, const float* c, const float* d, const float tolerance) {
  float normal[] = {0.f,0.f,0.f};
  float ad[] = {0.f,0.f,0.f};
  
  sub(ad, d, a);
  setFromCoplanarPoints( normal, a, b, c );
  return fabsf( dot( ad, normal ) ) < tolerance;
}

float* centroidFromIndices(float* out, const float* vertices, const int* indices, const int numIndices) {
  float n = numIndices;

  out[0] = out[1] = out[2] = 0.f;

  for (int i = 0; i < numIndices; i++) {
    int j = indices[i];
    out[0] += vertices[j++]/n;
    out[1] += vertices[j++]/n;
    out[2] += vertices[j++]/n;
  }

  return out;
}

int calcExtremes(int* outIndices, const float* vertices, const int numVertices, const int stride) {
  if (numVertices <= 0) {
    return 0;
  }

  const int NUM_EXTREMES = 2*FLOATS_PER_VERTEX;
  int numOutIndices = 0;
  float minAxis[FLOATS_PER_VERTEX];
  float maxAxis[FLOATS_PER_VERTEX];
  int extremes[NUM_EXTREMES] = {0};

  memcpy(minAxis, vertices, sizeof(minAxis));
  memcpy(maxAxis, vertices, sizeof(maxAxis));

  for (int i = stride; i < numVertices; i += stride) {
    for (int axis = 0; axis < FLOATS_PER_VERTEX; axis++) {
      const float v = vertices[i + axis];

      if (v < minAxis[axis]) {
        minAxis[axis] = v;
        extremes[axis] = i;
      }

      if (v > maxAxis[axis]) {
        maxAxis[axis] = v;
        extremes[axis + FLOATS_PER_VERTEX] = i;
      }
    }
  }

  // output unique indices
  outIndices[numOutIndices++] = extremes[0];

  for (int i = 1; i < NUM_EXTREMES; i++) {
    if (indexOfInt(outIndices, numOutIndices, extremes[i]) == -1) {
      outIndices[numOutIndices++] = extremes[i];
    }
  }

  return numOutIndices;
}

void buildFace(int* outIndices, float* outNormal, const float* vertices, const int ai, const int bi, const int ci, const float* hullCentroid) {
  float centroidToA[] = {0.f,0.f,0.f};
  outIndices[0] = ai;

  setFromCoplanarPoints(outNormal, vertices + ai, vertices + bi, vertices + ci);
  sub(centroidToA, vertices + ai, hullCentroid);

  const float cosine = dot(outNormal, centroidToA);
  if (cosine > 0.f) {
    outIndices[1] = bi;
    outIndices[2] = ci;
  } else {
    outIndices[1] = ci;
    outIndices[2] = bi;
    outNormal[0] = -outNormal[0];
    outNormal[1] = -outNormal[1];
    outNormal[2] = -outNormal[2];
  }
}

bool equals(const float* a, const float* b, const float tolerance) {
  return fabsf(a[0] - b[0]) < tolerance && fabsf(a[1] - b[1]) < tolerance && fabsf(a[2] - b[2]) < tolerance;
}

int calcFacingFaces(int* outFaces, const float* vertices, const int* faceIndices, const float* faceNormals, const int numFaces, const float* point) {
  int numOutFaces = 0;
  float faceToPoint[] = {0.f,0.f,0.f};
  
  for (int i = 0; i < numFaces; i++) {
    const int j = i*POINTS_PER_FACE;
    // if (equals(point, vertices + faceIndices[j], 5.f)) {
    //   return 0; // point too close to an existing point, ignore it
    // }

    sub(faceToPoint, point, vertices + faceIndices[j]); // line from the first point on the triangle
    normalize(faceToPoint, faceToPoint);

    const float cosine = dot(faceToPoint, faceNormals + i*FLOATS_PER_NORMAL);
    if (cosine > 0.f) {
      outFaces[numOutFaces++] = i;
    }
  }

  return numOutFaces;
}

int calcOutsideEdges(int* outEdges, const int* faceIndices, const int* faces, const int numFaces) {
  int outEdgesIndex = 0;

  // collect all edges
  for (int i = 0; i < numFaces; i++) {
    const int j = faces[i]*POINTS_PER_FACE;

    for (int k = 0; k < POINTS_PER_FACE; k++) {
      const int faceIndex = j + k;
      const int nextFaceIndex = faceIndex + (k == 2 ? -2 : 1);
      bool isInside = false;

      outEdges[outEdgesIndex++] = faceIndices[faceIndex];
      outEdges[outEdgesIndex++] = faceIndices[nextFaceIndex];
    }
  }

  // remove duplicates (an edge will only ever be duplicated zero or one times)
  for (int i = 0; i < outEdgesIndex; ) {
    int duplicateEdge = -1;

    for (int j = i + POINTS_PER_EDGE; j < outEdgesIndex; j += POINTS_PER_EDGE) {
      if ( (outEdges[i] == outEdges[j] && outEdges[i+1] == outEdges[j+1]) ||
        (outEdges[i] == outEdges[j+1] && outEdges[i+1] == outEdges[j]) ) {
        duplicateEdge = j;
        break;
      }
    }

    if (duplicateEdge >= 0) {
      // replace duplicateEdge first, in case it is the last index (in which case the copy does nothing)
      outEdges[duplicateEdge] = outEdges[outEdgesIndex-2];
      outEdges[duplicateEdge+1] = outEdges[outEdgesIndex-1];
      outEdgesIndex -= POINTS_PER_EDGE;

      // replace i (if i is now the last index then the copy does nothing)
      outEdges[i] = outEdges[outEdgesIndex-2];
      outEdges[i+1] = outEdges[outEdgesIndex-1];
      outEdgesIndex -= POINTS_PER_EDGE;
    } else {
      // only increment if we didn't find a duplicate
      i += POINTS_PER_EDGE;
    }
  }

  return outEdgesIndex/POINTS_PER_EDGE;
}

// int faceIndices[MAX_FACES][POINTS_PER_FACE] = {0};
// float faceNormals[MAX_FACES][FLOATS_PER_NORMAL] = {0.f};
// int outFaces[MAX_FACES] = {0};
// int outEdges[MAX_FACES][EDGES_PER_FACE][POINTS_PER_EDGE] = {0};
// int numOutFaces = 0;

EMSCRIPTEN_KEEPALIVE
int generateHullTriangles(int* outIndices, const float* vertices, const int numVertices, const int stride) {
  if (numVertices < 12) {
    return -1; // not enough vertices
  }

  const float TOLERANCE = 1e-5f;
  float centroid[] = {0.f,0.f,0.f}; // this is only the approximate center, but will always be within the hull
  int numFaces = 0;
  int numProcessed = 4;
  int numIndices = 0;

  int* outEdges = malloc(MAX_FACES*sizeof(int));
  int* outFaces = malloc(MAX_FACES*sizeof(int));
  int* faceIndices = malloc(MAX_FACES*POINTS_PER_FACE*sizeof(int));
  float* faceNormals = malloc(MAX_FACES*FLOATS_PER_NORMAL*sizeof(float));

  int extremes[6] = {0};
  const int numExtremes = calcExtremes(extremes, vertices, numVertices, stride);

  // form a triangular pyramid from the first 4 non-coplanar points
  int ai = extremes[0]; //0;
  int bi = extremes[1]; //stride;
  int ci = numExtremes > 2 ? extremes[2] : 2*stride; // the else cases may introduce duplicate indices
  int di = numExtremes > 3 ? extremes[3] : 3*stride;

  for ( ; di < numVertices; di += stride) {
    if (!areCoplanar(vertices + ai, vertices + bi, vertices + ci, vertices + di, TOLERANCE)) {
      add(centroid, vertices + ai, vertices + bi);
      add(centroid, centroid, vertices + ci);
      add(centroid, centroid, vertices + di);
      multiplyScalar(centroid, centroid, .25f);

      buildFace(faceIndices, faceNormals, vertices, ai, bi, ci, centroid);
      buildFace(faceIndices + 3, faceNormals + 3, vertices, ai, bi, di, centroid);
      buildFace(faceIndices + 6, faceNormals + 6, vertices, ai, ci, di, centroid);
      buildFace(faceIndices + 9, faceNormals + 9, vertices, bi, ci, di, centroid);
      numFaces = 4;
      numProcessed = 4;
      break;
    }
  }

  if (numFaces == 0) {
    return -2; // all points are coplanar, unable to build a hull
  }

  for (int xi = 3*stride; xi < numVertices; xi += stride) {
    // if (xi == di) {
    //   continue;
    // }

    // printf("numFaces %d %d of %d\n", numFaces, xi, numVertices);

    const int numFacing = calcFacingFaces(outFaces, vertices, faceIndices, faceNormals, numFaces, vertices + xi);

    if (numFacing == 0) {
      continue;
    }

    const int numEdges = calcOutsideEdges(outEdges, faceIndices, outFaces, numFacing);

    // recaluclate the centroid
    scaleAndAdd(centroid, vertices + xi, centroid, numProcessed);
    multiplyScalar(centroid, centroid, 1.f/(numProcessed + 1.f));

    // remove all facing triangles
    // replace the face with a face from the end of the list
    for (int index = numFacing - 1; index >= 0; index--) {
      numFaces--;

      const int faceIndex = outFaces[index];      
      const int j = faceIndex*POINTS_PER_FACE;
      const int n = numFaces*POINTS_PER_FACE;
      const int k = faceIndex*FLOATS_PER_NORMAL;
      const int m = numFaces*FLOATS_PER_NORMAL;

      faceIndices[j] = faceIndices[n];
      faceIndices[j+1] = faceIndices[n+1];
      faceIndices[j+2] = faceIndices[n+2];

      faceNormals[k] = faceNormals[m];
      faceNormals[k+1] = faceNormals[m+1];
      faceNormals[k+2] = faceNormals[m+2];
    }

    // add faces using the outside edges to the new xi point
    for (int index = 0; index < numEdges; index++) {
      const int edgeIndex = index*POINTS_PER_EDGE;
      const int faceIndex = numFaces*POINTS_PER_FACE;
      buildFace(faceIndices + faceIndex, faceNormals + faceIndex, vertices, outEdges[edgeIndex], outEdges[edgeIndex+1], xi, centroid);
      numFaces++;
      if (numFaces >= MAX_FACES) {
        // printf("too many faces\n");
        return -3; // out of memory, increase MAX_FACES
      }
    }

  }

  memcpy(outIndices, faceIndices, numFaces*POINTS_PER_FACE*sizeof(int));

  free(faceIndices);
  free(faceNormals);
  free(outEdges);
  free(outFaces);

  return numFaces*POINTS_PER_FACE;
}