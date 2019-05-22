#include <math.h>
#include <string.h>
#include "../../munit/munit.h"
#include "../../munit/munit.c"
#include "../src/hull.c"

static MunitResult
test_add(const MunitParameter params[], void* data) {
  const float a[] = {1.f,2.f,3.f};
  const float b[] = {-2.f,-4.f,-6.f};
  float out[] = {0.f,0.f,0.f};

  const float result1[] = {-1.f,-2.f,-3.f};
  add(out, a, b);
  munit_assert_memory_equal(sizeof(out), out, result1);

  return MUNIT_OK;
}

static MunitResult
test_sub(const MunitParameter params[], void* data) {
  const float a[] = {1.f,2.f,3.f};
  const float b[] = {-2.f,-4.f,-6.f};
  float out[] = {0.f,0.f,0.f};

  const float result1[] = {3.f,6.f,9.f};
  sub(out, a, b);
  munit_assert_memory_equal(sizeof(out), out, result1);

  return MUNIT_OK;
}

static MunitResult
test_dot(const MunitParameter params[], void* data) {
  const float a[] = {1.f,2.f,3.f};
  const float b[] = {-2.f,-4.f,-6.f};

  munit_assert_float( dot(a, b), ==, -28.f);

  return MUNIT_OK;
}

static MunitResult
test_multiplyScalar(const MunitParameter params[], void* data) {
  const float a[] = {1.f,2.f,3.f};
  float out[] = {0.f,0.f,0.f};

  const float result1[] = {3.f,6.f,9.f};
  multiplyScalar(out, a, 3.f);
  munit_assert_memory_equal(sizeof(out), out, result1);

  return MUNIT_OK;
}

static MunitResult
test_scaleAndAdd(const MunitParameter params[], void* data) {
  const float a[] = {1.f,2.f,3.f};
  const float b[] = {-2.f,-4.f,-6.f};
  float out[] = {0.f,0.f,0.f};

  const float result1[] = {.5f,1.f,1.5f};
  scaleAndAdd(out, a, b, .25f);
  munit_assert_memory_equal(sizeof(out), out, result1);

  scaleAndAdd(out, a, b, 0.f);
  munit_assert_memory_equal(sizeof(out), out, a);

  return MUNIT_OK;
}

static MunitResult
test_normalize(const MunitParameter params[], void* data) {
  const float a[] = {1.f,1.f,1.f};
  const float b[] = {0.f,0.f,0.f};
  const float c[] = {1.f,-2.f,3.f};
  float out[] = {0.f,0.f,0.f};

  normalize(out, b);
  munit_assert_memory_equal(sizeof(out), out, b);

  const float _SQRT3 = 1.f/sqrt(3.f);
  const float result1[] = {_SQRT3,_SQRT3,_SQRT3};
  normalize(out, a);
  munit_assert_memory_equal(sizeof(out), out, result1);

  const float _SQRT14 = 1.f/sqrt(1.f + 4.f + 9.f);
  const float result2[] = {_SQRT14, -2.f*_SQRT14, 3.f*_SQRT14};
  normalize(out, c);
  munit_assert_memory_equal(sizeof(out), out, result2);

  return MUNIT_OK;
}

static MunitResult
test_cross(const MunitParameter params[], void* data) {
  const float a[] = {4.f,5.f,6.f};
  const float b[] = {0.f,0.f,0.f};
  const float c[] = {1.f,-2.f,3.f};
  float out[] = {0.f,0.f,0.f};

  const float result1[] = {27.f,-6.f,-13.f};
  cross(out, a, c);
  munit_assert_memory_equal(sizeof(out), out, result1);

  cross(out, b, b);
  munit_assert_memory_equal(sizeof(out), out, b);

  cross(out, a, b);
  munit_assert_memory_equal(sizeof(out), out, b);

  return MUNIT_OK;
}

static MunitResult
test_setFromCoplanarPoints(const MunitParameter params[], void* data) {
  const float a[] = {1.f,1.f,1.f};
  const float b[] = {3.f,2.f,1.f};
  const float c[] = {2.f,-3.f,4.f};
  const float d[] = {4.f,-6.f,8.f};
  const float e[] = {8.f,-12.f,16.f};
  float out[] = {0.f,0.f,0.f};

  const float EPSILON = 1e-4;
  const float len1 = sqrt(3.f*3.f + 6.f*6.f + 9.f*9.f);
  const float result1[] = {3.f/len1, -6.f/len1, -9.f/len1};
  setFromCoplanarPoints(out, a, b, c);
  munit_assert_memory_equal(sizeof(out), out, result1);

  const float result2[] = {0.f,0.f,0.f};
  setFromCoplanarPoints(out, a, a, a);
  munit_assert_memory_equal(sizeof(out), out, result2);

  const float result3[] = {0.f,0.f,0.f};
  setFromCoplanarPoints(out, c, d, e); // parallel
  munit_assert_memory_equal(sizeof(out), out, result3);

  return MUNIT_OK;
}

static MunitResult
test_areCoplanar(const MunitParameter params[], void* data) {
  const float a[] = {1.f,1.f,1.f};
  const float b[] = {3.f,2.f,1.f};
  const float c[] = {2.f,-3.f,4.f};
  const float d[] = {4.f,-6.f,8.f};
  const float e[] = {8.f,-12.f,16.f};
  const float f[] = {1.f,-1.5f,2.f};
  float out[] = {0.f,0.f,0.f};

  const float EPSILON = 1e-4;
  const float len1 = sqrt(3.f*3.f + 6.f*6.f + 9.f*9.f);
  const float result1[] = {6.f/len1 + 1.f, 3.f/len1 + 1.f, 0.f + 1.f};
  munit_assert_true( areCoplanar(a, b, c, result1, EPSILON) );

  const float result2[] = {-1.f, -2.5f, 4.75f};
  munit_assert_false( areCoplanar(a, b, c, result2, EPSILON) );

  munit_assert_true( areCoplanar(a, b, c, a, EPSILON) );

  munit_assert_true( areCoplanar(a, a, a, a, EPSILON) );

  munit_assert_true( areCoplanar(c, d, e, f, EPSILON) ); // parallel

  return MUNIT_OK;
}

static MunitResult
test_centroidFromIndices(const MunitParameter params[], void* data) {
  const float verts[] = {1.f,2.f,3.f, 4.f,5.f,6.f, 7.f,8.f,9.f, -3.f,-2.f,-1.f};
  float out[] = {0.f,0.f,0.f};
  
  munit_assert_memory_equal( sizeof(out), centroidFromIndices(out, NULL, NULL, 0), out );

  const int indices1[] = {3};
  munit_assert_memory_equal( sizeof(out), centroidFromIndices(out, verts, indices1, 1), verts + indices1[0] );

  const int indices2[] = {0};
  munit_assert_memory_equal( sizeof(out), centroidFromIndices(out, verts, indices2, 1), verts );

  const int indices3[] = {0,6};
  const float result3[] = {4.f,5.f,6.f};
  munit_assert_memory_equal( sizeof(out), centroidFromIndices(out, verts, indices3, 2), result3 );

  const int indices4[] = {9,6,3,0};
  const float result4[] = {9.f/4.f, 13.f/4.f, 17.f/4.f};
  munit_assert_memory_equal( sizeof(out), centroidFromIndices(out, verts, indices4, 4), result4 );

  return MUNIT_OK;
}

static MunitResult
test_calcExtremes(const MunitParameter params[], void* data) {
  const float verts[] = {-1.f,-1.f,-1.f, -1.f,-1.f,1.f, -1.f,1.f,-1.f, -1.f,1.f,1.f, 1.f,-1.f,-1.f, 1.f,-1.f,1.f, 1.f,1.f,-1.f, 1.f,1.f,1.f};
  const float verts2[] = {-1.f,-1.f,-1.f, 1.f,1.f,1.f, -1.f,-1.f,1.f, -1.f,1.f,-1.f, -1.f,1.f,1.f, 1.f,-1.f,-1.f, 1.f,-1.f,1.f, 1.f,1.f,-1.f};
  int out[] = {-1,-1,-1,-1,-1,-1};

  const int numOut1 = calcExtremes(out, verts, 24, 3);
  const int result1[] = {0,12,6,3};
  munit_assert_int(numOut1, ==, 4);
  munit_assert_memory_equal( sizeof(result1), out, result1 );

  const int numOut2 = calcExtremes(out, verts2, 24, 3);
  const int result2[] = {0,3};
  munit_assert_int(numOut2, ==, 2);
  munit_assert_memory_equal( sizeof(result2), out, result2 );

  const int numOut3 = calcExtremes(out, NULL, 0, 0);
  munit_assert_int(numOut3, ==, 0);

  return MUNIT_OK;
}

static MunitResult
test_calcOutsideEdges(const MunitParameter params[], void* data) {
  const int faceIndices[] = {0,1,2, 1,2,3, 2,3,4, 3,4,1};
  const int faces[] = {0,1,2,3};
  const int numFaces = sizeof(faces)/sizeof(int);
  int out[32] = {0};

  const int numOut1 = calcOutsideEdges(out, faceIndices, faces, numFaces);
  const int result1[] = {0,1,4,1,2,0,4,2};
  munit_assert_int(numOut1, ==, 4);
  munit_assert_memory_equal( sizeof(result1), out, result1 );

  const int numOut2 = calcOutsideEdges(out, faceIndices, faces, 1);
  const int result2[] = {0,1,1,2,2,0};
  munit_assert_int(numOut2, ==, 3);
  munit_assert_memory_equal( sizeof(result2), out, result2 );

  const int numOut3 = calcOutsideEdges(out, faceIndices, faces, 0);
  munit_assert_int(numOut3, ==, 0);

  return MUNIT_OK;
}

static MunitResult
test_buildFaces(const MunitParameter params[], void* data) {
  const float EPSILON = 1e-4;
  const float verts[] = {0.f,0.f,0.f, 1.f,0.f,0.f, 1.f,1.f,0.f, .5f,.5f,1.f};
  const int vertIndices[] = {0,3,6,9};

  int outIndices[] = {-1,-1,-1};
  float outNormal[] = {0.f,0.f,0.f};
  float centroid[] = {0.f,0.f,0.f};

  centroidFromIndices(centroid, verts, vertIndices, 4);

  float normal1[] = {0.f,0.f,-1.f};
  int indices1[] = {0,6,3};
  buildFace(outIndices, outNormal, verts, 0, 3, 6, centroid);
  for (int i = 0; i < 3; i++) {
    munit_assert_float( fabs(outNormal[i] - normal1[i]), <, EPSILON);
  }
  munit_assert_memory_equal( sizeof(indices1), outIndices, indices1);

  float normal2[] = {0.f,-0.894427191f,.4472135955f};
  int indices2[] = {0,3,9};
  buildFace(outIndices, outNormal, verts, 0, 3, 9, centroid);
  for (int i = 0; i < 3; i++) {
    munit_assert_float( fabs(outNormal[i] - normal2[i]), <, EPSILON);
  }
  munit_assert_memory_equal( sizeof(indices2), outIndices, indices2);

  return MUNIT_OK;
}

static MunitResult
test_calcFacingFaces(const MunitParameter params[], void* data) {
  const float EPSILON = 1e-4;
  const float verts[] = {0.f,0.f,0.f, 1.f,0.f,0.f, 1.f,1.f,0.f, .5f,.5f,1.f};
  const int vertIndices[] = {0,3,6,9};
  const int NUM_VERTS = sizeof(vertIndices)/sizeof(int);
  const int NUM_FACES = 3;

  float centroid[] = {0.f,0.f,0.f};
  float faceNormals[NUM_FACES*3] = {0.f};
  int faceIndices[NUM_FACES*3] = {0};
  int outFaces[] = {-1,-1,-1};

  centroidFromIndices(centroid, verts, vertIndices, NUM_VERTS);
  buildFace(faceIndices, faceNormals, verts, 0, 3, 6, centroid);
  buildFace(faceIndices + 3, faceNormals + 3, verts, 0, 3, 9, centroid);
  buildFace(faceIndices + 6, faceNormals + 6, verts, 3, 6, 9, centroid);

  const int numFaces0 = calcFacingFaces(NULL, NULL, NULL, NULL, 0, NULL);
  munit_assert_int(numFaces0, ==, 0);

  const float point1[] = {.5f,0.f,1.f};
  const int numFaces1 = calcFacingFaces(outFaces, verts, faceIndices, faceNormals, NUM_FACES, point1);
  munit_assert_int(numFaces1, ==, 1);
  munit_assert_int(outFaces[0], ==, 1);

  const int numFaces2 = calcFacingFaces(outFaces, verts, faceIndices, faceNormals, NUM_FACES, centroid); // point is inside the pyramid
  munit_assert_int(numFaces2, ==, 0);

  return MUNIT_OK;
}

static MunitResult
test_generateHullTriangles(const MunitParameter params[], void* data) {
  const float verts[] = {-1.f,-1.f,-1.f, -1.f,-1.f,1.f, -1.f,1.f,-1.f, -1.f,1.f,1.f, 1.f,-1.f,-1.f, 1.f,-1.f,1.f, 1.f,1.f,-1.f, 1.f,1.f,1.f};
  const int numVerts = sizeof(verts)/sizeof(float);
  float verts2[114] = {0.f};
  const int numVerts2 = sizeof(verts2)/sizeof(float);

  int outIndices[128];

  const int numIndices1 = generateHullTriangles(outIndices, verts, numVerts, 3);
  const int result1[] = {0,6,12,0,12,3,0,3,6,9,3,15,6,3,9,3,12,15,12,6,18,6,9,18,15,12,18,9,15,21,15,18,21,18,9,21};
  munit_assert_int(numIndices1, ==, 36);
  munit_assert_memory_equal( sizeof(result1), outIndices, result1 );

  for (int i = 0; i < 90; i++) {
    verts2[i] = munit_rand_double() - .5f;
  }
  memcpy(verts2 + 90, verts, sizeof(verts));

  const int numIndices2 = generateHullTriangles(outIndices, verts2, numVerts2, 3);
  const int result2[] = {90,93,96,96,99,102,105,108,111};
  const int numResults2 = sizeof(result2)/sizeof(int);
  munit_assert_int(numIndices2, ==, 36);

  for (int i = 0; i < numIndices2; i++) {
    if (indexOfInt(result2, numResults2, outIndices[i]) == -1) {
      munit_errorf("missing vertex %d\n", outIndices[i]);
    }
  }

  return MUNIT_OK;
}

static MunitResult
test_ENDED(const MunitParameter params[], void* data) {
  return MUNIT_OK;
}

static MunitTest test_suite_tests[] = {
  {(char*)"add", test_add, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"sub", test_sub, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"dot", test_dot, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"multiplyScalar", test_multiplyScalar, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"scaleAndAdd", test_scaleAndAdd, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"normalize", test_normalize, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"cross", test_cross, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"setFromCoplanarPoints", test_setFromCoplanarPoints, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"areCoplanar", test_areCoplanar, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"centroidFromIndices", test_centroidFromIndices, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"calcExtremes", test_calcExtremes, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"calcOutsideEdges", test_calcOutsideEdges, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"buildFaces", test_buildFaces, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"calcFacingFaces", test_calcFacingFaces, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
  {(char*)"generateHullTriangles", test_generateHullTriangles, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },

  // There are some weird out of memory exceptions from wasm when there are an even number of test cases, so add this dummy test as necessary
  // {(char*)"ENDED", test_ENDED, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL }
};

static const MunitSuite test_suite = {
  (char*)"",
  test_suite_tests,
  NULL,
  1,
  MUNIT_SUITE_OPTION_NONE
};

int main(int argc, char* argv[MUNIT_ARRAY_PARAM(argc + 1)]) {
  return munit_suite_main(&test_suite, (void*)"unit", argc, argv);
}
