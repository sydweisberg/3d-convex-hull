from scipy.spatial import ConvexHull
import numpy as np

def convertToArr(points):
    return(np.array(points))

def convexHull(points):
    points = convertToArr(points)
    hull = ConvexHull(points)
    return hull

def main():
    # Test 1: Tetrahedron (4 points)
    print("Test 1: Tetrahedron")
    tetrahedron = [
        (0, 0, 0),
        (1, 0, 0),
        (0, 1, 0),
        (0, 0, 1)
    ]
    hull = convexHull(tetrahedron)
    faces = hull.simplices
    print(f"  Input: {len(tetrahedron)} points")
    print(f"  Triangular faces: {len(faces)}")
    for f in faces:
        print(f"    {f}")

    # Test 2: Cube (8 points)
    print("\nTest 2: Cube")
    cube = [
        (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),
        (0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)
    ]
    hull = convexHull(cube)
    faces = hull.simplices
    print(f"  Input: {len(cube)} points")
    print(f"  Triangular faces: {len(faces)}")
    for f in faces:
        print(f"    {f}")

    # Test 3: Pyramid (5 points)
    print("\nTest 3: Square Pyramid")
    pyramid = [
        (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),  # base
        (0.5, 0.5, 1)  # apex
    ]
    hull = convexHull(pyramid)
    faces = hull.simplices
    print(f"  Input: {len(pyramid)} points")
    print(f"  Triangular faces: {len(faces)}")
    for f in faces:
        print(f"    {f}")

if __name__ == "__main__":
    main()