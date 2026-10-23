#!/usr/bin/env python3
"""Independently recompute every math answer in bank_math_real.js with SymPy.

Usage:  python3 tools/verify_math.py
Exit code is non-zero if any blank in the bank disagrees with the computation,
or if a card in the bank has no computation here.
"""
import json
import re
import sys
from fractions import Fraction
from itertools import product
from pathlib import Path

from sympy import N as sp_N
from sympy import asin
from sympy import (Rational, cos, expand, factor, nsimplify, pi, radsimp, rad,
                   simplify, sin, solve, sqrt, symbols, totient)

ROOT = Path(__file__).resolve().parent.parent
x, y, a, b, c, k, n = symbols('x y a b c k n', real=True)


def load_bank():
    src = (ROOT / 'bank_math_real.js').read_text(encoding='utf8')
    body = src[src.index('concat(') + len('concat('):src.rindex(')')]
    return json.loads(body)


def frac(v):
    """Return (numerator, denominator) of a rational value."""
    r = Rational(v)
    return int(r.p), int(r.q)


def digits(*vals):
    return ''.join(str(v) for v in vals)


# ── One function per card: returns {blank key: expected answer} ──

def real_2025_1_1a():
    f = 3 * x**2 + 5 * x - 2 * a
    axis = Rational(-5, 6)
    assert solve(f.diff(x), x) == [axis]
    # Axis is left of [2, 5] and the parabola opens upward → f is increasing there
    lo = solve(f.subs(x, 2), a)[0]   # f(2) <= 0  ⇔  a >= lo
    hi = solve(f.subs(x, 5), a)[0]   # f(5) >= 0  ⇔  a <= hi
    return {'A': 5, 'B': 6, 'C': 2, 'D': 5, 'EF': lo, 'GH': hi}


def real_2025_1_1b():
    # G shifted by p along the x axis passes (2,0) and (5,0)
    p = symbols('p')
    g = 3 * (x - p)**2 + 5 * (x - p) - 2 * a
    sol = solve([g.subs(x, 2), g.subs(x, 5)], [p, a], dict=True)
    assert len(sol) == 1
    pn, pd = frac(sol[0][p])
    an, ad = frac(sol[0][a])
    return {'IJ': pn, 'K': pd, 'L': an, 'M': ad}


def coin_round():
    """One trial: holder of 2 coins vs holder of 1 coin → (P2 takes, P1 takes, tie)."""
    two = one = tie = Fraction(0)
    for coins in product([0, 1], repeat=3):
        h2, h1 = coins[0] + coins[1], coins[2]
        if h2 > h1:
            two += Fraction(1, 8)
        elif h1 > h2:
            one += Fraction(1, 8)
        else:
            tie += Fraction(1, 8)
    return two, one, tie


def real_2025_1_2():
    two, one, tie = coin_round()
    assert two + one + tie == 1
    # A starts with 2. A reaches 3 in trial 2: tie, then A (still the 2-holder) takes
    a_second = tie * two
    # B reaches 3 in trial 2: B takes in trial 1 (now B holds 2), then B takes again as the 2-holder
    b_second = one * two
    return {'N': two.numerator, 'O': two.denominator, 'P': one.numerator, 'Q': one.denominator,
            'R': tie.numerator, 'S': tie.denominator, 'T': a_second.numerator, 'UV': a_second.denominator,
            'W': b_second.numerator, 'XY': b_second.denominator}


def real_2025_2_1a():
    P = 6 * x**2 + 5 * x * y - 6 * y**2 + 8 * x - y + 2
    rest = P.coeff(x, 0)
    assert expand(rest + (3 * y + 2) * (2 * y - 1)) == 0
    assert expand((2 * x + 3 * y + 2) * (3 * x - 2 * y + 1) - P) == 0
    return {'A': 3, 'B': 2, 'C': 2, 'D': 1, 'E': 2, 'F': 3}


def real_2025_2_1b():
    xv = radsimp((sqrt(5) - 3) / (sqrt(5) + 1))
    yv = radsimp((sqrt(30) - sqrt(6) + 4) / (sqrt(6) + sqrt(5) + 1))
    assert simplify(xv - (2 - sqrt(5))) == 0
    assert simplify(yv - (sqrt(5) - 1)) == 0
    P = expand(6 * xv**2 + 5 * xv * yv - 6 * yv**2 + 8 * xv - yv + 2)
    assert simplify(P - (2 - 6 * sqrt(5))) == 0
    return {'G': 2, 'H': 5, 'I': 5, 'J': 1, 'K': 2, 'L': 6, 'M': 5}


def real_2025_2_2():
    assert factor(x**2 + 2 * x - 8) == (x - 2) * (x + 4)
    choices = [5 - a, 3 - a, 1 - a, -1 - a, -3 - a, a - 5, a - 3, a - 1, a + 1, a + 3]
    # |a-2-x| < 3  ⇔  a-5 < x < a+1
    lo, hi = a - 5, a + 1
    P_, Q_ = choices.index(lo), choices.index(hi)

    def common(av):
        """Integer grid scan of the common solution set of ① and ② (x in steps of 1/100)."""
        xs = [Fraction(t, 100) for t in range(-1000, 1500)]
        return [xv for xv in xs if -4 < xv < 2 and av - 5 < xv < av + 1]
    # exists ⇔ -5 < a < 7; check around the borders
    assert not common(-5) and common(Fraction(-49, 10)) and common(Fraction(69, 10)) and not common(7)
    # x = 0 excluded ⇔ a ≤ -1 or a ≥ 5
    for av in [Fraction(-49, 10), -1, 5, Fraction(69, 10)]:
        assert 0 not in common(av)
    for av in [Fraction(-9, 10), Fraction(49, 10)]:
        assert 0 in common(av)
    return {'N': 4, 'O': 2, 'P': P_, 'Q': Q_, 'R': 5, 'S': 1, 'T': 4, 'U': 7, 'V': 2,
            'W': 5, 'X': 7, 'Y': 1, 'Z': 5}


def real_2025_3():
    expr = (n**2 + 188 * n + 267) / (n**2 + 3 * n + 2)
    A_, X_, Y_ = symbols('A X Y')
    sol = solve(expand((A_ * (n + 1) * (n + 2) + X_ * (n + 2) + Y_ * (n + 1)) - (n**2 + 188 * n + 267)).as_poly(n).coeffs(), [A_, X_, Y_])
    assert simplify(sol[A_] + sol[X_] / (n + 1) + sol[Y_] / (n + 2) - expr) == 0
    from sympy import factorint, divisor_count
    assert factorint(80) == {2: 4, 5: 1} and factorint(105) == {3: 1, 5: 1, 7: 1}
    ns = [m for m in range(1, 200) if (m**2 + 188 * m + 267) % (m**2 + 3 * m + 2) == 0]
    ps = [(m**2 + 188 * m + 267) // (m**2 + 3 * m + 2) for m in ns]
    assert ns == [1, 3, 19]
    return {'A': sol[A_], 'BC': sol[X_], 'DEF': sol[Y_], 'G': 2, 'H': 4, 'I': 5,
            'JK': divisor_count(80), 'L': 3, 'M': 5, 'N': 7, 'O': divisor_count(105),
            'P': ns[0], 'Q': ns[1], 'RS': ns[2], 'TU': ps[0], 'VW': ps[1], 'XY': ps[2]}


def real_2025_4():
    AB_, BC_, CA_ = 3, 8, 7
    cosB = Rational(AB_**2 + BC_**2 - CA_**2, 2 * AB_ * BC_)
    assert cosB == Rational(1, 2)  # 60°
    S = Rational(1, 2) * AB_ * BC_ * sin(pi / 3)
    R = CA_ / (2 * sin(pi / 3))
    r = 2 * S / (AB_ + BC_ + CA_)
    assert simplify(S - 6 * sqrt(3)) == 0
    assert simplify(R - 7 * sqrt(3) / 3) == 0
    assert simplify(r - 2 * sqrt(3) / 3) == 0
    return {'AB': 60, 'C': 6, 'D': 3, 'E': 7, 'F': 3, 'G': 3, 'H': 2, 'I': 3, 'J': 3}


def real_2025_4b():
    # Coordinates: B=(0,0), C=(8,0), A at 60° from B with BA=3
    from sympy import Point, Circle, Line, Segment
    B, C, A = Point(0, 0), Point(8, 0), Point(Rational(3, 2), 3 * sqrt(3) / 2)
    assert simplify(A.distance(C) - 7) == 0
    circ = Circle(A, B, C)
    # (1) AD ∥ BC: D is the other intersection of the horizontal line through A
    D1 = [P_ for P_ in circ.intersection(Line(A, A + Point(1, 0))) if P_ != A][0]
    AD1 = simplify(A.distance(D1))
    E1 = Line(A, C).intersection(Line(B, D1))[0]
    AE1 = simplify(A.distance(E1))
    # ∠BCD for the trapezoid
    cosBCD = simplify(((B - C).dot(D1 - C)) / (C.distance(B) * C.distance(D1)))
    assert cosBCD == Rational(1, 2)
    # (2) D at the midpoint of arc AC not containing B: on the perpendicular bisector of AC, away from B
    mid = Point((A.x + C.x) / 2, (A.y + C.y) / 2)
    cands = circ.intersection(Line(mid, mid + Point(-(C.y - A.y), C.x - A.x)))
    D2 = [P_ for P_ in cands if simplify(P_.distance(B) - max(Q.distance(B) for Q in cands)) == 0][0]
    AD2 = simplify(A.distance(D2))
    E2 = Line(A, C).intersection(Line(B, D2))[0]
    AE2 = simplify(A.distance(E2))
    cosDAC = simplify(((D2 - A).dot(C - A)) / (A.distance(D2) * A.distance(C)))
    assert simplify(cosDAC - sqrt(3) / 2) == 0  # 30°
    assert AD1 == 5 and simplify(AD2 - 7 * sqrt(3) / 3) == 0
    n1, d1 = frac(AE1)
    n2, d2 = frac(AE2)
    return {'KL': 60, 'M': AD1, 'NO': n1, 'PQ': d1, 'RS': 30, 'T': 7, 'U': 3, 'V': 3, 'WX': n2, 'YZ': d2}


def real_2024_1_1():
    f = a * x**2 - 6 * a * x + 2 * b
    assert expand(f - (a * (x - 3)**2 - 9 * a + 2 * b)) == 0
    # a>0: min at the vertex x=3, max at x=1 (farther from the axis than x=4)
    s1 = solve([f.subs(x, 3) + 2, f.subs(x, 1) - 6], [a, b])
    # a<0: max at x=3, min at x=1
    s2 = solve([f.subs(x, 3) - 6, f.subs(x, 1) + 2], [a, b])
    assert s1[a] > 0 and s2[a] < 0
    fx, gx = f.subs(s1), f.subs(s2)
    shift = simplify(gx - (-fx))
    assert shift.is_number
    return {'A': 3, 'B': 9, 'C': 2, 'D': 1, 'E': 3, 'F': s1[a], 'G': s1[b],
            'H': 3, 'I': 1, 'JK': s2[a], 'LM': s2[b], 'N': shift}


def real_2024_1_2():
    from itertools import combinations
    color = {1: 'w', 2: 'w', 3: 'r', 4: 'r', 5: 'r', 6: 'b', 7: 'b', 8: 'b', 9: 'b'}
    triples = list(combinations(range(1, 10), 3))
    tot = len(triples)
    same = Fraction(sum(len({color[c] for c in t}) == 1 for t in triples), tot)
    alldiff = Fraction(sum(len({color[c] for c in t}) == 3 for t in triples), tot)
    sum10 = Fraction(sum(sum(t) == 10 for t in triples), tot)
    cond3 = Fraction(sum(len({color[c] for c in t}) >= 2 and any(c % 2 == 0 for c in t) for t in triples), tot)
    return {'O': same.numerator, 'PQ': same.denominator, 'R': alldiff.numerator, 'S': alldiff.denominator,
            'T': sum10.numerator, 'UV': sum10.denominator, 'WX': cond3.numerator, 'YZ': cond3.denominator}


def real_2024_2_1():
    v = 3 * sqrt(5) + 2
    A_ = int((3 * sqrt(5)).evalf() // 1)
    av = int(v.evalf() // 1)
    bv = v - av
    X, Y = symbols('X Y')
    lhs = radsimp(X / bv + bv / Y)
    # (XY + D)√5 + E(XY − F) over G·Y
    D_, E_, F_, G_ = 9, 2, 9, 3
    assert simplify(lhs - ((X * Y + D_) * sqrt(5) + E_ * (X * Y - F_)) / (G_ * Y)) == 0
    # = 8 with X, Y rational: √5 part 0, rational part 2(XY−9) = 24Y
    sol = solve([X * Y + D_, E_ * (X * Y - F_) - G_ * av * Y], [X, Y], dict=True)
    assert len(sol) == 1
    yn, yd = frac(-sol[0][Y])
    return {'A': A_, 'B': av, 'C': av - 2, 'D': D_, 'E': E_, 'F': F_, 'G': G_, 'H': 0,
            'IJ': G_ * av // E_, 'K': sol[0][X], 'L': yn, 'M': yd}


def real_2024_2_2():
    f = 2 * x**2 - 4 * a * x + 2 * a**2 + a - 3

    def roots(av):
        return sorted(r for r in (sp_N(rt) for rt in solve(f.subs(a, av), x)) if r.is_real)

    def check(av, cond):
        r = roots(av)
        return len(r) == 2 and r[0] != r[1] and cond(r)
    grid = [Fraction(t, 20) for t in range(-80, 80)]
    both_pos = [g for g in grid if check(g, lambda r: r[0] > 0)]
    opp = [g for g in grid if check(g, lambda r: r[0] < 0 < r[1])]
    split2 = [g for g in grid if check(g, lambda r: 0 < r[0] < 2 < r[1])]
    two = [g for g in grid if len(set(roots(g))) == 2]
    assert max(two) < 3 and min(both_pos) > 1 and max(both_pos) < 3
    assert min(opp) > Fraction(-3, 2) and max(opp) < 1
    assert min(split2) > 1 and max(split2) < Fraction(5, 2)
    assert Fraction(-3, 2) + Fraction(1, 20) in opp and Fraction(5, 2) - Fraction(1, 20) in split2
    return {'N': 3, 'O': 1, 'P': 3, 'QR': -3, 'S': 2, 'T': 1, 'U': 1, 'V': 5, 'W': 2}


def real_2024_3():
    ok = lambda m: m % 3 == 0 and m % 5 == 3 and m % 7 == 4
    sols = [m for m in range(0, 1000) if ok(m)]
    period = sols[1] - sols[0]
    assert all(b2 - a2 == period for a2, b2 in zip(sols, sols[1:]))
    first3 = next(m for m in sols if m >= 100)
    upto500 = [m for m in sols if 1 <= m <= 500]
    # y = 3k (from 3(x−1) = 5y), y = 7ℓ + 3 (from 7(z−2) = 5(y−3)), k = 7m + 1
    for m in range(-3, 4):
        k_ = 7 * m + 1
        y_ = 3 * k_
        assert ok(5 * y_ + 3) and (y_ - 3) % 7 == 0
    return {'A': 3, 'B': 1, 'C': 5, 'D': 3, 'E': 7, 'F': 2, 'G': 3, 'H': 7, 'I': 3, 'J': 1, 'K': 7,
            'LMN': period, 'OP': sols[0], 'QRS': first3, 'T': len(upto500), 'UVW': upto500[-1]}


def ab_cd_triangle():
    """B=(0,0), C=(2,0), A with AB=4, AC=3; D on ray BC beyond C with ∠CAD = ∠BAC."""
    from sympy import Point
    ax_ = solve([x**2 + y**2 - 16, (x - 2)**2 + y**2 - 9], [x, y], dict=True)
    Av = [s_ for s_ in ax_ if s_[y] > 0][0]
    A = Point(Av[x], Av[y])
    B, C = Point(0, 0), Point(2, 0)
    t = symbols('t', positive=True)
    D = Point(2 + t, 0)
    cosBAC = simplify((B - A).dot(C - A) / (A.distance(B) * A.distance(C)))
    cosCAD = (C - A).dot(D - A) / (A.distance(C) * A.distance(D))
    ts = [tt for tt in solve(simplify(cosCAD**2 - cosBAC**2), t) if tt.is_positive and simplify(cosCAD.subs(t, tt) - cosBAC) == 0]
    assert len(ts) == 1
    return A, B, C, Point(2 + ts[0], 0), cosBAC


def real_2024_4():
    A, B, C, D, cosBAC = ab_cd_triangle()
    xv, yv = simplify(A.distance(D)), simplify(C.distance(D))
    # relation x² − y² − (21/4)x + 9 = 0 holds and x = 2y
    assert simplify(xv**2 - yv**2 - Rational(21, 4) * xv + 9) == 0 and simplify(xv - 2 * yv) == 0
    from sympy import Polygon
    S1, S2 = abs(Polygon(A, B, C).area), abs(Polygon(A, B, D).area)
    r1 = 2 * S1 / (4 + 2 + 3)
    r2 = 2 * S2 / (4 + B.distance(D) + xv)
    ratio = simplify(r2 / r1)
    assert simplify(ratio - Rational(6, 7) * S2 / S1) == 0
    cn, cd = frac(cosBAC)
    yn, yd = frac(yv)
    rn, rd = frac(ratio)
    return {'A': cn, 'B': cd, 'CD': 21, 'E': 4, 'F': 9, 'G': 2, 'H': xv, 'I': yn, 'J': yd,
            'K': 6, 'L': 7, 'M': rn, 'N': rd}


def incenter(P1, P2, P3):
    from sympy import Point
    a_, b_, c_ = P2.distance(P3), P1.distance(P3), P1.distance(P2)
    return Point((a_ * P1.x + b_ * P2.x + c_ * P3.x) / (a_ + b_ + c_), (a_ * P1.y + b_ * P2.y + c_ * P3.y) / (a_ + b_ + c_))


def real_2024_4b():
    A, B, C, D, _ = ab_cd_triangle()
    I1, I2 = incenter(A, B, C), incenter(A, B, D)
    ell = simplify(B.distance(I2))
    ratio = simplify(I1.distance(I2) / B.distance(I1))
    i12 = simplify(I1.distance(I2))
    assert simplify(ell - sqrt(6)) == 0 and simplify(i12 - sqrt(6) / 3) == 0
    pn, pd = frac(ratio)
    return {'O': 6, 'P': pn, 'Q': pd, 'R': 6, 'S': 3}


def real_2023_2_1():
    f = -x**2 + 4 * x + 5
    vx = solve(f.diff(x), x)[0]
    vy = f.subs(x, vx)
    g = -(x - k - vx)**2 + vy - 4
    choices = [(k < -5, k**2 + 6 * k + 7), (k < -5, k**2 - 4 * k + 2), (k < -3, k**2 + 7 * k + 6),
               (k < -3, k**2 + 6 * k + 7), (k < -3, k**2 - 4 * k + 2), (k > 2, k**2 - 6 * k + 4),
               (k > 2, k**2 + 6 * k + 7), (k > 2, k**2 - 4 * k + 2), (k > 4, k**2 - 4 * k + 2), (k > 4, k**2 + 6 * k + 7)]
    # axis left of [-1,4] (k+2 < -1): max at x = -1; axis right (k+2 > 4): max at x = 4
    left = expand(g.subs(x, -1) - 3)
    right = expand(g.subs(x, 4) - 3)
    E_ = next(i for i, (c_, eq) in enumerate(choices) if i <= 4 and c_ == (k < -3) and expand(eq + left) == 0)
    F_ = next(i for i, (c_, eq) in enumerate(choices) if i >= 5 and c_ == (k > 2) and expand(eq + right) == 0)
    kl = [r for r in solve(left, k) if r.evalf() < -3]
    kr = [r for r in solve(right, k) if r.evalf() > 2]
    assert kl == [-3 - sqrt(2)] and kr == [2 + sqrt(2)]
    return {'A': vx, 'B': vy, 'C': vx, 'D': vy - 4, 'E': E_, 'F': F_, 'G': 3, 'H': 2, 'I': 2, 'J': 2}


def real_2023_2_I2():
    from math import comb, factorial
    tetra = comb(6, 4) * factorial(3 - 1)
    cube6 = 5 * factorial(4 - 1)          # top colour, then a ring of 4
    cube5 = 5 * factorial(4 - 1) // 2      # doubled colour top & bottom, ring of 4 that can be flipped
    # brute force check of the cube counts with the rotation group
    faces = range(6)  # 0 top 1 bottom 2 front 3 right 4 back 5 left
    rots = cube_rotations()

    def count(colors, n_used):
        seen = set()
        for col in product(colors, repeat=6):
            if len(set(col)) != n_used:
                continue
            adj = [(0, 2), (0, 3), (0, 4), (0, 5), (1, 2), (1, 3), (1, 4), (1, 5), (2, 3), (3, 4), (4, 5), (5, 2)]
            if any(col[i] == col[j] for i, j in adj):
                continue
            seen.add(min(tuple(col[r[i]] for i in faces) for r in rots))
        return len(seen)
    assert count(range(6), 6) == cube6 and count(range(5), 5) == cube5
    return {'KL': comb(6, 4), 'M': factorial(2), 'NO': tetra, 'PQ': cube6, 'RS': cube5}


def cube_rotations():
    """The 24 rotations of a cube as face permutations (faces: 0 top 1 bottom 2 front 3 right 4 back 5 left)."""
    def turn_z(p):   # around the vertical axis: front → right → back → left
        return [p[0], p[1], p[5], p[2], p[3], p[4]]

    def turn_x(p):   # around the left-right axis: top → front → bottom → back
        return [p[4], p[2], p[0], p[3], p[1], p[5]]
    group, frontier = {tuple(range(6))}, [list(range(6))]
    while frontier:
        p = frontier.pop()
        for q in (turn_z(p), turn_x(p)):
            if tuple(q) not in group:
                group.add(tuple(q))
                frontier.append(q)
    assert len(group) == 24
    return [list(g) for g in group]


def real_2023_2_2():
    z = symbols('z')
    poly = expand((-x + 2 * y + 3 * z) * (2 * x - 3 * y + 4 * z) * (3 * x + 4 * y - 5 * z))
    coef = poly.coeff(x, 1).coeff(y, 1).coeff(z, 1)
    num, den, d = 479, 700, None
    for _ in range(2023):
        num *= 10
        d, num = divmod(num, den)
    av = Fraction(228, 999)
    bv = Fraction(335244, 999999)
    xv = 2 * av - bv
    assert xv * 99 == 12
    return {'ABC': coef, 'D': d, 'E': 1, 'F': 2, 'GH': 12, 'I': xv.numerator, 'JK': xv.denominator}


def real_2023_2_II2():
    assert factor(x**2 - 3 * x + 2) == (x - 1) * (x - 2)
    assert factor(x**2 - 2 * a * x - 3 * a**2) == (x + a) * (x - 3 * a)

    def sol2(av):   # open interval of ② or None
        lo, hi = sorted([-av, 3 * av])
        return None if lo == hi else (lo, hi)

    def contains(av):
        s2 = sol2(av)
        return s2 is not None and s2[0] <= 1 and 2 <= s2[1]

    def disjoint(av):
        s2 = sol2(av)
        return s2 is None or s2[1] <= 1 or s2[0] >= 2
    grid = [Fraction(t, 30) for t in range(-150, 150)]
    inc = [g for g in grid if contains(g)]
    dis = [g for g in grid if disjoint(g)]
    assert max(g for g in inc if g < 0) == -2 and min(g for g in inc if g > 0) == Fraction(2, 3)
    assert min(dis) == -1 and max(dis) == Fraction(1, 3) and all(Fraction(-1) <= g <= Fraction(1, 3) for g in dis)
    return {'L': 1, 'M': 2, 'N': 0, 'O': 1, 'P': 9, 'Q': 4, 'RS': -2, 'T': 2, 'U': 3, 'VW': -1, 'X': 1, 'Y': 3}


def real_2023_2_3():
    from math import gcd
    from sympy import factorint
    av, bv = 588, 1260
    assert factorint(av) == {2: 2, 3: 1, 7: 2} and factorint(bv) == {2: 2, 3: 2, 5: 1, 7: 1}
    g = gcd(av, bv)
    L = av * bv // g
    lcm3 = lambda p_, q_, r_: lcm2(lcm2(p_, q_), r_)
    cs = [c_ for c_ in range(1, 4 * L + 1) if (4 * L) % c_ == 0 and gcd(g, c_) == g and lcm3(av, bv, c_) == 4 * L]
    # 7x − 15y = 4: smallest positive y
    xs = next((xx, yy) for yy in range(1, 50) for xx in range(1, 200) if 7 * xx - 15 * yy == 4)
    assert all(av * (xs[0] + 15 * kk) - bv * (xs[1] + 7 * kk) == cs[0] for kk in range(-3, 4))
    return {'A': 2, 'B': 7, 'C': 2, 'D': 2, 'E': 2, 'F': 5, 'G': 7, 'HI': g, 'J': len(cs), 'KLM': cs[0],
            'N': av // g, 'OP': bv // g, 'Q': cs[0] // g, 'R': xs[0], 'S': xs[1], 'T': xs[0], 'UV': 15, 'W': xs[1], 'X': 7}


def lcm2(p_, q_):
    from math import gcd
    return p_ * q_ // gcd(p_, q_)


def circle_2023_2():
    """Circumcircle radius √6 centred at O; A on top, diameter AD, ∠BAD = 15°, AC = 2√3."""
    from sympy import Point, Line
    Rr = sqrt(6)
    A = Point(0, Rr)
    D = Point(0, -Rr)
    # B: ∠BAD = 15° with B to the left; inscribed angle 15° ⇒ central angle ∠BOD = 30°
    B = Point(-Rr * sin(pi / 6), -Rr * cos(pi / 6))
    # C on the right with AC = 2√3 ⇒ central angle ∠AOC with chord 2√3: 2R sin(θ/2) = 2√3 ⇒ θ = 90°
    C = Point(Rr, 0)
    assert simplify(A.distance(C) - 2 * sqrt(3)) == 0
    E = Line(A, D).intersection(Line(B, C))[0]
    return A, B, C, D, E


def real_2023_2_4():
    A, B, C, D, E = circle_2023_2()
    cosB = simplify((A - B).dot(C - B) / (B.distance(A) * B.distance(C)))
    assert simplify(cosB - sqrt(2) / 2) == 0
    BC = simplify(B.distance(C))
    AB = simplify(A.distance(B))
    assert simplify(BC - 3 * sqrt(2)) == 0 and simplify(AB - (3 + sqrt(3))) == 0
    c15 = simplify(AB / A.distance(D))
    assert simplify(c15 - (sqrt(2) + sqrt(6)) / 4) == 0 and simplify(c15 - cos(pi / 12)) == 0
    return {'AB': 45, 'C': 3, 'D': 2, 'E': 3, 'F': 3, 'G': 2, 'H': 6, 'I': 4}


def real_2023_2_4b():
    from sympy import Polygon
    A, B, C, D, E = circle_2023_2()
    cosAEC = simplify((A - E).dot(C - E) / (E.distance(A) * E.distance(C)))
    assert simplify(cosAEC - Rational(1, 2)) == 0
    CE, DE = simplify(C.distance(E)), simplify(D.distance(E))
    assert simplify(CE - 2 * sqrt(2)) == 0 and simplify(DE - (sqrt(6) - sqrt(2))) == 0
    S_abc, S_eac, S_ebd = (abs(Polygon(*p_).area) for p_ in ((A, B, C), (E, A, C), (E, B, D)))
    assert simplify(S_abc / S_eac - Rational(3, 2)) == 0
    assert simplify(S_ebd / S_eac - (2 - sqrt(3)) / 2) == 0
    return {'JK': 60, 'L': 2, 'M': 2, 'N': 6, 'O': 2, 'P': 3, 'Q': 2, 'R': 2, 'S': 3}


def real_2023_1_1():
    f = Rational(1, 3) * x**2 + a * x - b
    g = -x**2 + c * x + b
    eq1 = expand(-3 * (f.subs(x, -1) - g.subs(x, -1)))   # 3a + 6b − 3c − 4
    eq2 = expand(f.subs(x, 3) - g.subs(x, 3))             # 3a − 2b − 3c + 12
    assert expand(eq1 - (3 * a + 6 * b - 3 * c - 4)) == 0 and expand(eq2 - (3 * a - 2 * b - 3 * c + 12)) == 0
    fmin = f.subs(x, -Rational(3, 2) * a)
    gmax = g.subs(x, c / 2)
    sols = solve([eq1, eq2, gmax - fmin - Rational(16, 3)], [a, b, c], dict=True)
    assert len({(s_[a], s_[b], s_[c]) for s_ in sols}) == 1
    s_ = sols[0]
    assert expand(12 * (gmax - fmin - Rational(16, 3)).subs(b, 2) - (9 * a**2 + 3 * c**2 - 16)) == 0
    jn, jd = frac(-s_[a])
    return {'A': 6, 'B': 3, 'C': 4, 'D': 3, 'E': 3, 'F': s_[b], 'G': 9, 'HI': 16, 'J': jn, 'K': jd, 'L': s_[c]}


def real_2023_1_I2():
    choices = [Fraction(8, 81), Fraction(14, 81), Fraction(56, 81), Fraction(64, 81), Fraction(25, 126),
               Fraction(35, 126), Fraction(115, 126), Fraction(125, 126), Fraction(8, 729), Fraction(10, 729)]
    trip = list(product(range(1, 10), repeat=3))
    p1 = Fraction(sum(a_ == b_ != c_ for a_, b_, c_ in trip), 729)
    p2 = Fraction(sum(len({a_, b_, c_}) == 3 for a_, b_, c_ in trip), 729)
    good = [(a_, b_, c_) for a_, b_, c_ in trip if a_ > 2 * b_ > 3 * c_]
    p3 = Fraction(len(good), 729)
    bs = sorted({b_ for _, b_, _ in good})
    from itertools import combinations
    A3, B2 = list(combinations(range(1, 10), 3)), list(combinations(range(1, 10), 2))
    odd = lambda t: sum(v % 2 for v in t)
    q1 = Fraction(sum(odd(s1) + odd(s2) == 4 for s1 in A3 for s2 in B2), len(A3) * len(B2))
    q2 = Fraction(sum(odd(s1) + odd(s2) >= 1 for s1 in A3 for s2 in B2), len(A3) * len(B2))
    idx = choices.index
    return {'M': idx(p1), 'N': idx(p2), 'O': bs[0], 'P': bs[-1], 'Q': idx(p3), 'R': idx(q1), 'S': idx(q2)}


def real_2023_1_II1():
    z = symbols('z')
    P = 2 * x**2 + 12 * y**2 - 2 * z**2 - 11 * x * y + 5 * y * z
    assert expand((4 * y - z) * (3 * y + 2 * z) - (12 * y**2 + 5 * y * z - 2 * z**2)) == 0
    opts = [(x - 4*y + z) * (x + 3*y + 2*z), (x - 4*y + z) * (2*x - 3*y - 2*z), (x + 4*y - z) * (x + 3*y + 2*z),
            (x + 4*y - z) * (2*x + 3*y + 2*z), (2*x - 4*y + z) * (x - 3*y - 2*z), (2*x - 4*y + z) * (2*x - 3*y - 2*z),
            (2*x + 4*y - z) * (x + 3*y + 2*z), (2*x + 4*y - z) * (2*x + 3*y + 2*z)]
    D_ = [i for i, o in enumerate(opts) if expand(o - P) == 0]
    assert len(D_) == 1
    sub = {x: 3 + sqrt(5), y: a + sqrt(5), z: -3 + sqrt(5)}
    Pv = expand(P.subs(sub))
    assert expand(Pv - 6 * expand((2 * a + sqrt(5)) * (a - 4 + sqrt(5)))) == 0
    irr = Pv.coeff(sqrt(5))
    av = solve(irr, a)
    assert len(av) == 1
    kn, kd = frac(av[0])
    return {'A': 4, 'B': 3, 'C': 2, 'D': D_[0], 'E': 6, 'F': 2, 'G': 5, 'H': 6, 'I': 2, 'J': 4, 'K': kn, 'L': kd}


def real_2023_1_II2():
    M_opts = [a**2 - 2*a - 3, a**2 + 2*a - 3, a**2 - 3*a - 2, a**2 + 3*a - 2]
    disc1 = expand((a - 1)**2 - 4 * (-a + 1))
    M_ = M_opts.index(disc1)
    O_opts = [a**2 - 2*a*b + 1, a**2 + 2*a*b - 1, a**2 - 4*a*b + Rational(1, 4), a**2 - 4*a*b + 1, a**2 + 4*a*b - 1]
    disc2 = expand(((4 * a)**2 - 4 * 4 * (4 * a * b - 1)) / 16)
    O_ = O_opts.index(disc2)
    P_opts = {5: (a - b)**2 - b**2 + 1, 6: (a + b)**2 - b**2 - 1, 7: (a - 2*b)**2 - 4*b**2 - Rational(1, 4),
              8: (a - 2*b)**2 - 4*b**2 + 1, 9: (a + 2*b)**2 - 4*b**2 - 1}
    P_ = [kk for kk, v in P_opts.items() if expand(v - disc2) == 0][0]

    def m(bv):   # min of f(a) = a² − 4ab + 1 over a ≤ −3 or a ≥ 1
        fa = lambda av: av * av - 4 * av * bv + 1
        cands = [fa(Fraction(-3)), fa(Fraction(1))]
        if 2 * bv <= -3 or 2 * bv >= 1:
            cands.append(fa(2 * bv))
        return min(cands)
    grid = [Fraction(t, 120) for t in range(-360, 361)]
    ok = [bv for bv in grid if m(bv) >= 0]
    assert min(ok) == Fraction(-5, 6) and max(ok) == Fraction(1, 2)
    # piecewise minimum check against the listed expressions
    for bv in grid:
        if bv <= Fraction(-3, 2):
            assert m(bv) == -4 * bv * bv + 1
        elif bv <= Fraction(-1, 2):
            assert m(bv) == 12 * bv + 10
        elif bv <= Fraction(1, 2):
            assert m(bv) == -4 * bv + 2
        else:
            assert m(bv) == -4 * bv * bv + 1
    return {'M': M_, 'N': 7, 'O': O_, 'P': P_, 'Q': 1, 'R': 9, 'S': 3, 'T': 7, 'U': 4, 'V': 5, 'W': 9, 'X': 2, 'Y': 4}


def real_2023_1_3():
    U = range(1, 1000)
    A_ = [v for v in U if not set(str(v)) & set('789')]
    B_ = [v for v in U if not set(str(v)) & set('369')]
    AB = [v for v in A_ if v in B_]
    notA_B = [v for v in B_ if v not in A_]
    B3 = [v for v in B_ if v >= 100]
    m9 = sorted((v for v in B3 if v % 9 == 0), reverse=True)
    m18 = sorted(v for v in B3 if v % 18 == 0)
    return {'ABC': len(A_), 'DEF': len(AB), 'GHI': len(notA_B), 'JKL': A_[159], 'MNO': B_[159],
            'PQR': m9[1], 'STU': m18[1]}


def real_2023_1_4():
    EB2 = 1 + 3 - 2 * 1 * sqrt(3) * cos(5 * pi / 6)
    assert simplify(EB2 - 7) == 0
    Rr = sqrt(EB2) / (2 * sin(5 * pi / 6))
    assert simplify(Rr - sqrt(7)) == 0
    BD2 = 7 + 7 - 2 * 7 * cos(2 * pi / 3)
    xs = [v for v in solve(x**2 + 16 - 2 * 4 * x * cos(pi / 3) - BD2, x) if v > 0]
    assert xs == [5]
    area = (Rational(1, 2) * 1 * sqrt(3) * sin(5 * pi / 6) + Rational(1, 2) * 7 * sin(2 * pi / 3)
            + Rational(1, 2) * 4 * 5 * sin(pi / 3))
    assert simplify(area - 7 * sqrt(3)) == 0
    # the five vertices really lie on one circle of radius √7 with these chords
    chord = lambda L: 2 * asin(L / (2 * sqrt(7)))
    arcs = [chord(sqrt(3)), chord(4), chord(5), chord(sqrt(7)), chord(1)]
    assert abs(sum(arcs).evalf() - 2 * pi.evalf()) < 1e-9
    return {'A': 7, 'B': 7, 'CD': 30, 'EFG': 120, 'HI': simplify(BD2), 'JK': 60, 'L': 4, 'M': 5, 'N': 5, 'O': 7, 'P': 3}


def real_2022_2_I1():
    p_, q_ = symbols('p q')
    f = a * (x - p_)**2 + q_
    # half-chords 2 and 3
    sol = solve([f.subs(x, p_ + 2) - 1, f.subs(x, p_ + 3) - 3], [a, q_], dict=True)[0]
    g = f.subs(sol)
    ps = [pp for pp in solve(g.subs(x, 2) + Rational(1, 5), p_) if pp < 2]
    assert len(ps) == 1
    poly = expand(g.subs(p_, ps[0]))
    bv, cv = poly.coeff(x, 1), poly.coeff(x, 0)
    fn, fd = frac(sol[a])
    hn, hd = frac(-sol[q_])
    jn, jd = frac(-bv)
    ln_, ld = frac(-cv)
    return {'A': 2, 'B': 4, 'C': 1, 'D': 9, 'E': 3, 'F': fn, 'G': fd, 'H': hn, 'I': hd, 'J': jn, 'K': jd, 'L': ln_, 'M': ld}


def real_2022_2_I2():
    choices = [Fraction(12, 27), Fraction(16, 27), Fraction(11, 54), Fraction(13, 54), Fraction(19, 54),
               Fraction(37, 54), Fraction(41, 54), Fraction(43, 54), Fraction(49, 108), Fraction(71, 108)]
    con = lambda m_, n_: abs(m_ - n_) <= 1
    two = Fraction(sum(con(a_, b_) for a_, b_ in product(range(1, 7), repeat=2)), 36)
    three = Fraction(sum(con(a_, b_) and con(b_, c_) for a_, b_, c_ in product(range(1, 7), repeat=3)), 216)
    return {'N': two.numerator, 'O': two.denominator, 'P': (1 - two).numerator, 'Q': (1 - two).denominator,
            'R': choices.index(three), 'S': choices.index(1 - three), 'T': choices.index(two - three)}


def real_2022_2_1():
    sols = [(xx, yy) for xx in range(1, 40) for yy in range(1, 40) if xx < yy < 2 * xx and 3 * xx + 2 * yy == 70]
    assert len(sols) == 1
    return {'A': 2, 'B': 3, 'C': 2, 'D': 5, 'E': 7, 'FG': 10, 'HI': 14, 'J': 2, 'KL': sols[0][0], 'MN': sols[0][1]}


def real_2022_2_II2():
    eq = x**2 + 2 * a * x + 4 * a**2 - 10 * a + 7
    d4 = expand(a**2 - (4 * a**2 - 10 * a + 7))
    assert d4 == -3 * a**2 + 10 * a - 7
    lo, hi = sorted(solve(d4, a))
    mx = d4.subs(a, Rational(5, 3))
    good = []
    for av in solve(d4 - 1, a):
        r = sorted(solve(eq.subs(a, av), x))
        diff = simplify(r[1] - r[0])
        assert diff == 2 and lo < av < hi
        good.append(av)
    good.sort()
    pn, pd = frac(hi)
    un, ud = frac(mx)
    xn, xd = frac(good[0])
    return {'O': lo, 'P': pn, 'Q': pd, 'R': 2, 'S': 3, 'T': 7, 'U': un, 'V': ud, 'W': 1, 'X': xn, 'Y': xd, 'Z': good[1]}


def real_2022_2_3():
    S = [v for v in range(1, 200) if v % 3 and v % 5]
    res = sorted({v % 15 for v in S})
    opts = [[0, 2, 4, 6, 8, 10, 12, 14], [1, 3, 5, 7, 9, 11, 13], [0, 1, 2, 4, 7, 8, 11, 13, 14],
            [1, 2, 4, 7, 8, 11, 13, 14], [1, 2, 4, 7, 8, 10, 11, 13, 14]]
    pairs = [(a_, b_) for a_ in S for b_ in S if 30 <= a_ < b_ <= 45 and (a_ + b_) % 15 == 2]
    assert len(pairs) == 1
    return {'AB': 15, 'C': 0, 'DE': 14, 'F': opts.index(res), 'G': len(res), 'HI': S[49],
            'JK': len([v for v in S if v <= 45]), 'LM': len([v for v in S if v <= 50]), 'NO': pairs[0][0], 'PQ': pairs[0][1]}


def real_2022_2_4():
    from sympy import Point, Line, Polygon, Circle, tan, atan
    # AB = 4: B=(0,0), C=(w,0), A=(0,4), D=(w,4), P=(0,3); semicircle on BC with centre M=(w/2,0)
    w = symbols('w', positive=True)
    M = Point(w / 2, 0)
    P, Dp = Point(0, 3), Point(w, 4)
    # PD tangent to the circle: distance from M to line PD equals w/2
    dist = Line(P, Dp).distance(M)
    ws = [v for v in solve(dist**2 - (w / 2)**2, w) if v.is_positive]
    assert len(ws) == 1
    wv = ws[0]
    B, C, M, P, Dp = Point(0, 0), Point(wv, 0), Point(wv / 2, 0), Point(0, 3), Point(wv, 4)
    T = Circle(M, wv / 2).intersection(Line(P, Dp))
    assert len(T) == 1
    T = T[0]
    assert simplify(P.distance(Dp) - 7) == 0 and simplify(wv - 4 * sqrt(3)) == 0
    assert simplify(B.distance(T) / C.distance(T) - sqrt(3) / 2) == 0
    area = lambda *pts: abs(Polygon(*pts).area)
    r1 = simplify(area(P, B, T) / area(M, C, T))
    r2 = simplify(area(M, B, T) / area(Dp, C, T))
    r3 = simplify(area(P, B, T) / area(Dp, C, T))
    assert (r1, r2, r3) == (Rational(3, 4), Rational(3, 4), Rational(9, 16))
    cos_theta = simplify((P - B).dot(T - B) / (B.distance(P) * B.distance(T)))
    cos_dct = simplify((Dp - C).dot(T - C) / (C.distance(Dp) * C.distance(T)))
    assert simplify(cos_theta - 2 * sqrt(7) / 7) == 0 and simplify(cos_dct - sqrt(21) / 7) == 0
    return {'A': 3, 'B': 4, 'C': 7, 'D': 4, 'E': 1, 'F': 3, 'G': 3, 'H': 2, 'I': 3, 'J': 2, 'K': 3, 'L': 4,
            'M': 3, 'N': 4, 'O': 9, 'PQ': 16, 'R': 3, 'S': 2, 'T': 2, 'U': 7, 'V': 7, 'WX': 21, 'Y': 7}


def real_2022_1_I1():
    h = lambda t: -2 * t
    f = x**2 + a * x + b
    px, py = -a / 2, f.subs(x, -a / 2)
    bsol = solve(py - h(px), b)[0]
    L = expand((f.subs(x, 3) - h(3) + f.subs(x, -2) - h(-2)).subs(b, bsol))
    assert expand(L - (a**2 / 2 + 3 * a + 15)) == 0
    lo_a, hi_a = sorted(solve(px + 2, a) + solve(px - 3, a))   # px from -2 to 3
    vals = [L.subs(a, v) for v in (lo_a, hi_a, -3)]
    Lmin, Lmax = min(vals), max(vals)
    mn, md = frac(Lmin)
    return {'A': 2, 'B': 4, 'C': -lo_a, 'D': hi_a, 'E': 4, 'F': 3, 'GH': 15, 'IJ': mn, 'K': md, 'LM': Lmax}


def real_2022_1_I2():
    from itertools import combinations
    pairs = list(combinations(range(9), 2))

    def swap(arr, i, j):
        arr = list(arr)
        arr[i], arr[j] = arr[j], arr[i]
        return arr
    start = list(range(1, 10))
    p_not9 = p_9 = Fraction(0)
    p2 = Fraction(0)
    for i, j in pairs:
        s1 = swap(start, i, j)
        moved9 = 8 in (i, j)
        for i2, j2 in pairs:
            s2 = swap(s1, i2, j2)
            if s2[-1] % 2 == 0:
                if moved9:
                    p_9 += Fraction(1, 36 * 36)
                else:
                    p_not9 += Fraction(1, 36 * 36)
        rest = [k for k in range(9) if k not in (i, j)]
        for i2, j2 in combinations(rest, 2):
            if swap(s1, i2, j2)[-1] % 2 == 0:
                p2 += Fraction(1, 36 * 21)
    tot = p_not9 + p_9
    return {'N': p_not9.numerator, 'OP': p_not9.denominator, 'QR': p_9.numerator, 'STU': p_9.denominator,
            'V': tot.numerator, 'WX': tot.denominator, 'Y': p2.numerator, 'Z': p2.denominator}


def real_2022_1_2a():
    xv, yv = sqrt(8 + sqrt(55)), sqrt(8 - sqrt(55))
    assert simplify(xv * yv - 3) == 0
    assert simplify((xv + yv)**2 - 22) == 0 and simplify((xv - yv)**2 - 10) == 0
    tenth = int((sqrt(22) * 10).evalf()) % 10
    return {'A': int(sqrt(55).evalf()), 'B': int(xv.evalf()), 'C': int(yv.evalf()), 'D': 3, 'E': 2, 'FG': 22,
            'H': 2, 'IJ': 10, 'K': 2, 'L': tenth}


def real_2022_1_2b():
    expr = (6 * x + 2) / (x**2 - 2 * x + 2)
    eq = expand(k * (x**2 - 2 * x + 2) - (6 * x + 2))
    assert expand(eq - (k * x**2 - 2 * (k + 3) * x + 2 * (k - 1))) == 0
    d4 = expand((k + 3)**2 - k * 2 * (k - 1))
    assert expand(-d4 - (k**2 - 8 * k - 9)) == 0
    crit = solve(expr.diff(x), x)
    vals = {cv: simplify(expr.subs(x, cv)) for cv in crit}
    xmax = [cv for cv, v in vals.items() if v == 9][0]
    xmin = [cv for cv, v in vals.items() if v == -1][0]
    wn, wd = frac(xmax)
    return {'M': 2, 'N': 3, 'O': 2, 'P': 1, 'Q': 1, 'R': 3, 'S': 8, 'T': 9, 'U': 1, 'V': 9, 'W': wn, 'X': wd, 'Y': -xmin}


def real_2022_1_3():
    p_, q_ = symbols('p q')
    opts = [p_ * q_, 1, p_, q_, p_**2, p_ - 1, p_ * q_ - p_ - q_, (p_ - 1) * (q_ - 1), p_ * (p_ * q_ - p_ - q_), p_ * (p_ - 1) * (q_ - 1)]
    idx = lambda e: [i for i, o in enumerate(opts) if expand(sympify_(o) - e) == 0][0]
    pq_rel = p_ * q_ - q_ - p_ + 1
    p2q = p_**2 * q_ - p_ * q_ - p_**2 + p_
    for pv, qv in [(2, 3), (3, 5), (5, 7), (2, 19)]:
        assert totient(pv * qv) == pq_rel.subs({p_: pv, q_: qv})
        assert totient(pv * pv * qv) == p2q.subs({p_: pv, q_: qv})
    from sympy import isprime
    sols = [(pv, qv) for pv in range(2, 40) for qv in range(2, 100)
            if pv != qv and isprime(pv) and isprime(qv) and totient(pv * pv * qv) == 36]
    assert sols == [(2, 19), (3, 7)]
    return {'A': totient(5), 'B': totient(6), 'C': totient(12), 'D': idx(p_ - 1), 'E': idx(q_), 'F': idx(p_), 'G': idx(1),
            'H': idx(pq_rel), 'I': idx(p_ * q_), 'J': idx(p_**2), 'K': idx(p_), 'L': idx(p2q),
            'M': 2, 'N': 2, 'O': 3, 'P': 2, 'Q': 2, 'RS': 19, 'T': 3, 'U': 7}


def sympify_(v):
    from sympy import sympify
    return sympify(v)


def real_2022_1_4():
    rr = symbols('r', positive=True)
    rs = solve(sin(pi / 6) * (4 - rr) - rr, rr)
    dn, dd = frac(rs[0])
    return {'AB': 30, 'C': 4, 'D': dn, 'E': dd}


def real_2022_1_4b():
    from sympy import Point, Circle, Polygon
    O = Point(0, 0)
    A = Point(0, 2)
    B = Point(-sqrt(3), -1)
    C = Point(sqrt(3), -1)
    assert simplify(B.distance(C) - 2 * sqrt(3)) == 0
    xs = [v for v in solve(x**2 - 3 * x - 3, x) if v.is_positive]
    xv = xs[0]
    # P on the long arc (same side as A) with PB = 3
    P = [Q for Q in Circle(O, 2).intersection(Circle(B, 3)) if Q.y > -1][0]
    assert simplify(P.distance(C) - xv) == 0
    ell = 4 * pi / 3 + 3 + xv
    Sp = abs(Polygon(P, B, C).area)
    assert simplify(Sp - 9 * (sqrt(3) + sqrt(7)) / 8) == 0
    S = Sp + (4 * pi / 3 - sqrt(3))
    assert simplify(S - (4 * pi / 3 + (sqrt(3) + 9 * sqrt(7)) / 8)) == 0
    assert simplify(ell - (4 * pi / 3 + (9 + sqrt(21)) / 2)) == 0
    return {'F': 2, 'G': 3, 'H': 3, 'I': 3, 'J': 3, 'KL': 21, 'M': 2, 'N': 4, 'O': 3, 'P': 9,
            'Q': 9, 'R': 3, 'S': 7, 'T': 8, 'U': 4, 'V': 3, 'W': 3, 'X': 9, 'Y': 7, 'Z': 8}


def real_2021_1_I1():
    f = -2 * x**2
    g = x**2 + a * x + b
    av = solve(g.diff(x).subs(x, 3), a)[0]
    bv = solve((g - f).subs({a: av, x: 4}), b)[0]
    gv = g.subs({a: av, b: bv})
    gmin = gv.subs(x, 3)
    roots = solve(f - gv, x)
    other = [r for r in roots if r != 4][0]
    d = expand(f - gv)
    crit = solve(d.diff(x), x)[0]
    assert other <= crit <= 4
    poly = expand(-(f - gv) / 3)
    return {'A': -av, 'BC': -bv, 'DE': -gmin, 'F': -poly.coeff(x, 1), 'G': -poly.coeff(x, 0), 'H': -other,
            'I': crit, 'JK': d.subs(x, crit)}


def real_2021_1_I2():
    res = [(1 if p_ > q_ else -1 if p_ < q_ else 0) for p_, q_ in product([1, 2, 3], repeat=2)]
    pw, pl, pt = (Fraction(res.count(v), 9) for v in (1, -1, 0))
    seqs = list(product([1, -1, 0], repeat=4))
    prob = lambda sq: (pw ** sq.count(1)) * (pl ** sq.count(-1)) * (pt ** sq.count(0))
    p3 = sum(prob(sq) for sq in seqs if sq.count(1) >= 3)
    p112 = sum(prob(sq) for sq in seqs if (sq.count(1), sq.count(-1), sq.count(0)) == (1, 1, 2))
    peq = sum(prob(sq) for sq in seqs if sq.count(1) == sq.count(-1))
    pmore = sum(prob(sq) for sq in seqs if sq.count(1) > sq.count(-1))
    assert pmore.denominator == peq.denominator == 81
    return {'L': pt.numerator, 'M': pt.denominator, 'N': p3.numerator, 'O': p3.denominator, 'P': p112.numerator,
            'QR': p112.denominator, 'ST': peq.numerator, 'UV': peq.denominator, 'WX': pmore.numerator}


def real_2021_1_II1():
    ms = [mm for mm in range(1, 20) for nn in range(1, 20)
          if Rational(mm, 3) < sqrt(3) < Rational(nn, 4) and Rational(nn, 3) < sqrt(6) < Rational(mm, 2)]
    ns = [nn for mm in range(1, 20) for nn in range(1, 20)
          if Rational(mm, 3) < sqrt(3) < Rational(nn, 4) and Rational(nn, 3) < sqrt(6) < Rational(mm, 2)]
    assert len(ms) == 1
    vals = [sqrt((-3) * (-4))**3, 6 * sqrt((-2)**3 * (-3)), sqrt(((-4) * (-3)**2)**2), (-1)**3 * sqrt(((-2)**5)**2),
            (5 * sqrt(3) / (1 - sqrt(6)))**2]
    v5 = radsimp(expand(vals[4]))
    assert simplify(v5 - (21 + 6 * sqrt(6))) == 0
    order = sorted(range(5), key=lambda i: vals[i].evalf())
    return {'A': ms[0], 'B': ns[0], 'CD': 21, 'E': 6, 'F': 6, 'G': sum(1 for v in vals if float(v) > 35),
            'H': sum(1 for v in vals if float(v) < 0), 'I': order[0] + 1, 'J': order[1] + 1, 'K': order[2] + 1,
            'L': order[3] + 1, 'M': order[4] + 1}


def real_2021_1_II2():
    bv = solve(9 + 3 * a + b - 1, b)[0]
    f = x**2 + a * x + bv
    fm1 = f.subs(x, -1)
    lo = solve(fm1 - 25, a)[0]
    hi = solve(fm1 - 13, a)[0]
    m = expand(f.subs(x, -a / 2))
    assert expand(m - (-(a + 6)**2 / 4 + 1)) == 0
    vals = {av: m.subs(a, av) for av in (lo, hi, -6)}
    amax = max(vals, key=vals.get)
    amin = min(vals, key=vals.get)
    return {'N': 3, 'O': 8, 'P': 3, 'Q': 8, 'R': -lo, 'S': -hi, 'T': 4, 'U': 6, 'V': 1,
            'W': -amax, 'X': vals[amax], 'Y': -amin, 'Z': vals[amin]}


def real_2021_1_3():
    sols = [(a_, b_, c_) for a_ in range(1, 5) for b_ in range(0, 5) for c_ in range(1, 5)
            if 25 * a_ + 5 * b_ + c_ == 81 * c_ + 9 * b_ + a_]
    assert len(sols) == 1
    a_, b_, c_ = sols[0]
    Nv = 25 * a_ + 5 * b_ + c_
    base4 = ''
    t = Nv
    while t:
        base4 = str(t % 4) + base4
        t //= 4
    return {'A': 1, 'B': 4, 'C': 0, 'D': 4, 'E': 1, 'F': 4, 'GH': 25, 'I': 5, 'JK': 81, 'L': 9, 'M': 6, 'NO': 20,
            'P': a_, 'Q': b_, 'R': c_, 'STU': Nv, 'VWXY': base4}


def tri_2021_1():
    from sympy import Point, Line
    # BC on the x axis, B=(0,0), C=(1,0); angles B=45°, C=75°
    B, C = Point(0, 0), Point(1, 0)
    A = Line(B, B + Point(1, 1)).intersection(Line(C, C + Point(-cos(pi * 5 / 12), sin(pi * 5 / 12))))[0]
    # angle bisector from A meets BC at D with BD:DC = AB:AC
    ab, ac = A.distance(B), A.distance(C)
    D = Point(ab / (ab + ac), 0)
    return A, B, C, D


def real_2021_1_4():
    A, B, C, D = tri_2021_1()
    assert simplify(A.distance(C) / B.distance(C) - sqrt(6) / 3) == 0
    assert simplify(A.distance(D) / B.distance(D) - sqrt(2)) == 0
    assert simplify(B.distance(D) / B.distance(C) - 1 / sqrt(3)) == 0
    assert simplify(A.distance(C) / A.distance(B) - (sqrt(3) - 1)) == 0
    cosADC = simplify((A - D).dot(C - D) / (D.distance(A) * D.distance(C)))
    assert simplify(cosADC - cos(pi * 5 / 12)) == 0
    return {'A': 6, 'B': 3, 'C': 2, 'DE': 75, 'F': 1, 'G': 3, 'H': 1, 'I': 3, 'J': 1}


def real_2021_1_4b():
    from sympy import Polygon, Triangle
    A, B, C, D = tri_2021_1()
    O1 = Triangle(A, B, D).circumcenter
    O2 = Triangle(A, D, C).circumcenter
    ang = lambda P_, Q_, R_: simplify(((P_ - Q_).dot(R_ - Q_)) / (Q_.distance(P_) * Q_.distance(R_)))
    assert simplify(ang(A, O1, D)) == 0                         # 90°
    assert simplify(ang(A, O2, O1) - cos(pi * 5 / 12)) == 0     # 75°
    assert simplify(A.distance(C) / A.distance(O1) - sqrt(2)) == 0
    assert simplify(A.distance(O2) / A.distance(O1) - (sqrt(3) - 1)) == 0
    ratio = simplify(abs(Polygon(A, O1, O2).area) / abs(Polygon(A, B, C).area))
    assert simplify(ratio - (2 - sqrt(3))) == 0
    return {'KL': 90, 'MN': 75, 'O': 2, 'P': 3, 'Q': 1, 'R': 1, 'S': 2, 'T': 3}


def real_2021_2_1():
    f = -2 * x**2 + 4 * (a + 1) * x - a**2 - 5 * a
    vx = solve(f.diff(x), x)[0]
    vy = expand(f.subs(x, vx))
    assert vx == a + 1 and vy == a**2 - a + 2
    return {'A': 1, 'B': 2}


def real_2021_2_2():
    xv = radsimp(2 / (5 - sqrt(21)))
    assert simplify(xv - (5 + sqrt(21)) / 2) == 0
    return {'A': 5, 'B': 2, 'C': simplify(xv + 1 / xv)}


def real_2021_2_4():
    S = Rational(1, 2) * 2 * sqrt(2) * sin(rad(135))
    BC2 = 2**2 + 2 - 2 * 2 * sqrt(2) * cos(rad(135))
    return {'A': simplify(S), 'BC': simplify(BC2)}


def var_math_001():
    return {'A': solve((x**2 - 4 * x + a - 1).subs(x, 2) - 2, a)[0]}


def var_math_002():
    r = solve(x**2 - 6 * x + c, x)
    return {'A': solve((r[1] - r[0])**2 - 16, c)[0]}


def var_math_003():
    m = symbols('m')
    return {'AB': -2, 'C': 6} if sorted(solve(m**2 - 4 * (m + 3), m)) == [-2, 6] else {}


def var_math_004():
    sc = Fraction(1, 4) - 1
    sc /= 2
    return {'AB': sc.numerator, 'C': sc.denominator}


def var_math_005():
    xx, yy = next((xx, yy) for xx in range(1, 50) for yy in range(1, 50) if 17 * xx - 11 * yy == 1)
    return {'A': xx, 'B': yy}


def var_math_006():
    PB = Fraction(36, 4)
    return {'A': PB, 'B': PB - 4}


def main():
    bank = load_bank()
    failures = 0
    for card in bank:
        fn = globals().get(card['id'].replace('-', '_'))
        if fn is None:
            print(f'MISSING  {card["id"]}: no computation in verify_math.py')
            failures += 1
            continue
        expected = {key: str(val) for key, val in fn().items()}
        actual = {bl['key']: str(bl['ans']) for bl in card.get('blanks', [])}
        bad = [f'{key}: bank={actual.get(key)} calc={expected.get(key)}'
               for key in sorted(set(actual) | set(expected))
               if actual.get(key) != expected.get(key)]
        if bad:
            failures += 1
            print(f'FAIL     {card["id"]}  ' + '; '.join(bad))
        else:
            print(f'ok       {card["id"]}  ' + ' '.join(f'{k}={v}' for k, v in actual.items()))
    print(f'\n{len(bank) - failures}/{len(bank)} cards verified')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
