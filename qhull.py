from scipy.spatial import ConvexHull

def main():
    print("Test 1: tetradedron")
    # 1. Tetrahedron
    points1 = [
        (0, 0, 0),
        (1, 0, 0),
        (0, 1, 0),
        (0, 0, 1)
    ]
    print("input: ", points1)
    output = ConvexHull(points1)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points1[i])
    print("test 2: triangular prism")
    # 2. Triangular Prism
    points2 = [
        (0, 0, 0),
        (2, 0, 0),
        (1, 2, 0),

        (0, 0, 1),
        (2, 0, 1),
        (1, 2, 1)
    ]
    print("input: ", points2)
    output = ConvexHull(points2)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points2[i])
    print("test 3: cube")
    # 3. Cube 
    points3 = [
        (0, 0, 0),
        (1, 0, 0),
        (1, 1, 0),
        (0, 1, 0),
        (0, 0, 1),
        (1, 0, 1),
        (1, 1, 1),
        (0, 1, 1)
    ]
    print("input: ", points3)
    output = ConvexHull(points3)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points3[i])
    print("test 4: pyramid")
    # 4. Pyramid
    points4 = [
        (0, 0, 0),
        (2, 0, 0),
        (2, 2, 0),
        (0, 2, 0),
        (1, 1, 2)
    ]
    print("input: ", points4)
    output = ConvexHull(points4)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points4[i])
    print("test 5: pyramid with one interior point")
    # 5. Pyramid with one interior point
    points5 = [
        (0, 0, 0),
        (2, 0, 0),
        (2, 2, 0),
        (0, 2, 0),
        (1, 1, 2),
        (1, 1, 0.5)   # interior
    ]
    print("input: ", points5)
    output = ConvexHull(points5)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points5[i])
    print("test 6: random convex polyhedron")
    # 6. Random Convex Polyhedron
    points6 = [
        (0, 0, 0),
        (2, 0, 0),
        (0, 2, 0),
        (0, 0, 2),
        (2, 2, 2),
        (1, 3, 1),
        (3, 1, 1)
    ]
    print("input: ", points6)
    output = ConvexHull(points6)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points6[i])
    print("test 7: random concave polyhedron")
    points7 = [
    (0, 0, 0),   # 0
    (2, 0, 0),   # 1
    (2, 2, 0),   # 2
    (0, 2, 0),   # 3

    (0, 0, 2),   # 4
    (2, 0, 2),   # 5
    (2, 2, 2),   # 6
    (0, 2, 2),   # 7

    (1, 1, 1)    # 8 inward "dent" point (creates concavity)
    ]
    print("input: ", points7)
    output = ConvexHull(points7)
    print("output: ")
    for s in output.simplices:
        print('\n')
        for i in s:
            print(points7[i])


if __name__ == "__main__":
    main()