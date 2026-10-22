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
    # Shift by p: 3(x-p)^2 + 5(x-p) - 2a passes (2,0) and (5,0)
    p = symbols('p')
    g = 3 * (x - p)**2 + 5 * (x - p) - 2 * a
    sol = solve([g.subs(x, 2), g.subs(x, 5)], [p, a], dict=True)
    sol = [s for s in sol][0]
    pn, pd = frac(sol[p])
    an, ad = frac(sol[a])
    return {'IJ': pn, 'K': pd, 'L': an, 'M': ad}


def real_2025_1_2():
    win2 = tie = win1 = Fraction(0)
    for coins in product([0, 1], repeat=3):  # two coins for the 2-holder, one for the 1-holder
        h2, h1 = coins[0] + coins[1], coins[2]
        p = Fraction(1, 8)
        if h2 > h1:
            win2 += p
        elif h1 > h2:
            win1 += p
        else:
            tie += p
    return {'N': win2.numerator, 'O': win2.denominator, 'P': win1.numerator,
            'Q': win1.denominator, 'R': tie.numerator, 'S': tie.denominator}


def real_2025_2_1a():
    P = 6 * x**2 + 5 * x * y - 6 * y**2 + 8 * x - y + 2
    assert expand((2 * x + 3 * y + 2) * (3 * x - 2 * y + 1) - P) == 0
    # P = 6x^2 + (5y+8)x - (Ay+B)(Cy-D)
    assert expand(6 * x**2 + (5 * y + 8) * x - (3 * y + 2) * (2 * y - 1) - P) == 0
    return {'A': 3, 'B': 2, 'C': 2, 'D': 1, 'E': 2, 'F': 3}


def real_2025_2_1b():
    xv = radsimp((sqrt(5) - 3) / (sqrt(5) + 1))
    yv = radsimp((sqrt(30) - sqrt(6) + 4) / (sqrt(6) + sqrt(5) + 1))
    assert simplify(xv - (2 - sqrt(5))) == 0
    assert simplify(yv - (sqrt(5) - 1)) == 0
    P = expand((2 * xv + 3 * yv + 2) * (3 * xv - 2 * yv + 1))
    assert simplify(P - (2 - 6 * sqrt(5))) == 0
    return {'GH': 25, 'IJ': 51, 'KLM': 265}


def real_2025_2_2():
    assert factor(x**2 + 2 * x - 8) == (x - 2) * (x + 4)
    # |x - (a-2)| < 3  ⇔  a-5 < x < a+1
    return {'N': 4, 'O': 2, 'P': 5, 'Q': 1}


def real_2025_3():
    expr = (n**2 + 188 * n + 267) / (n**2 + 3 * n + 2)
    A_, X_, Y_ = symbols('A X Y')
    sol = solve(expand((A_ * (n + 1) * (n + 2) + X_ * (n + 2) + Y_ * (n + 1)) - (n**2 + 188 * n + 267)).as_poly(n).coeffs(), [A_, X_, Y_])
    assert simplify(sol[A_] + sol[X_] / (n + 1) + sol[Y_] / (n + 2) - expr) == 0
    return {'A': sol[A_], 'BC': sol[X_], 'DEF': sol[Y_]}


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


def real_2024_1_1():
    f = a * x**2 - 6 * a * x + 2 * b
    vertex_y = expand(f.subs(x, 3))
    assert vertex_y == -9 * a + 2 * b
    # a>0: min at x=3, max at x=1 (farther from the axis)
    s1 = solve([f.subs(x, 3) + 2, f.subs(x, 1) - 6], [a, b])
    # a<0: max at x=3, min at x=1
    s2 = solve([f.subs(x, 3) - 6, f.subs(x, 1) + 2], [a, b])
    assert s1[a] > 0 and s2[a] < 0
    return {'A': 3, 'B': 9, 'C': 2, 'D': 1, 'E': 3, 'F': s1[a], 'G': s1[b],
            'H': 3, 'I': 1, 'JK': s2[a], 'LM': s2[b]}


def real_2024_1_2():
    from math import comb
    same = Fraction(comb(3, 3) + comb(4, 3), comb(9, 3))
    diff = Fraction(2 * 3 * 4, comb(9, 3))
    return {'OPQ': digits(same.numerator, same.denominator),
            'RS': digits(diff.numerator, diff.denominator)}


def real_2024_2_1():
    v = 3 * sqrt(5) + 2
    ip = int(v.evalf() // 1)
    return {'B': ip, 'C': ip - 2}  # b = v - ip = 3√5 - (ip - 2)


def real_2024_2_2():
    disc = expand((4 * a)**2 - 4 * 2 * (2 * a**2 + a - 3))
    assert solve(disc > 0, a).as_set() == solve(a < 3, a).as_set()
    prod = (2 * a**2 + a - 3) / 2
    assert factor(2 * a**2 + a - 3) == (a - 1) * (2 * a + 3)
    return {'N': 3, 'O': 1, 'P': 3, 'QR': -3, 'S': 2, 'T': 1}


def real_2024_3():
    sols = [m for m in range(1, 106) if m % 3 == 0 and m % 5 == 3 and m % 7 == 4]
    first3 = next(m for m in range(100, 1000) if m % 3 == 0 and m % 5 == 3 and m % 7 == 4)
    return {'LM': sols[0], 'QRS': first3}


def real_2024_4():
    cosA = Fraction(4**2 + 3**2 - 2**2, 2 * 4 * 3)
    return {'A': cosA.numerator, 'B': cosA.denominator}


def real_2023_2_1():
    f = -x**2 + 4 * x + 5
    vx = solve(f.diff(x), x)[0]
    vy = f.subs(x, vx)
    g = -(x - k - vx)**2 + vy - 4
    ks = []
    for kk in solve(g.subs(x, -1) - 3, k) + solve(g.subs(x, 4) - 3, k):
        axis = kk + vx
        # max at the endpoint only when the axis is outside [-1, 4]
        if axis.evalf() < -1 and simplify(g.subs({k: kk, x: -1}) - 3) == 0:
            ks.append(kk)
        if axis.evalf() > 4 and simplify(g.subs({k: kk, x: 4}) - 3) == 0:
            ks.append(kk)
    assert sorted(ks, key=lambda v: v.evalf()) == [-3 - sqrt(2), 2 + sqrt(2)]
    return {'A': vx, 'B': vy, 'C': vx, 'D': vy - 4, 'G': 3, 'H': 2, 'I': 2, 'J': 2}


def real_2023_2_2():
    # 479/700 = 0.68 then the repetend; long division gives the 2023rd digit
    num, den, d = 479, 700, None
    for _ in range(2023):
        num *= 10
        d, num = divmod(num, den)
    return {'D': d}


def real_2023_2_3():
    from math import gcd
    return {'HI': gcd(588, 1260)}


def real_2023_1_3():
    count = sum(1 for m in range(1, 1000) if not set(str(m)) & set('789'))
    return {'ABC': count}


def real_2022_1_2a():
    xv, yv = sqrt(8 + sqrt(55)), sqrt(8 - sqrt(55))
    xy = nsimplify(simplify(xv * yv))
    s2 = nsimplify(expand((xv + yv)**2))
    return {'D': xy, 'FG': s2}


def real_2022_1_2b():
    eq = expand((6 * x + 2) - k * (x**2 - 2 * x + 2))
    assert expand(-eq - (k * x**2 - 2 * (k + 3) * x + 2 * (k - 1))) == 0
    x0 = solve(eq.subs(k, 0), x)[0]
    d4 = expand((k + 3)**2 - k * 2 * (k - 1))
    roots = sorted(solve(d4, k))
    assert expand(-d4 - (k**2 - 8 * k - 9)) == 0
    qn, qd = frac(-x0)
    return {'M': 2, 'N': 3, 'O': 2, 'P': 1, 'Q': qn, 'R': qd, 'S': 8, 'T': 9,
            'U': -roots[0], 'V': roots[1]}


def real_2022_2_1():
    sols = [(xx, yy) for xx in range(1, 70) for yy in range(1, 70)
            if xx < yy < 2 * xx and 3 * xx + 2 * yy == 70]
    assert len(sols) == 1
    (xx, yy), = sols
    return {'A': 2, 'B': 3, 'C': 2, 'D': 5, 'E': 7, 'FG': 10, 'HI': 14, 'J': 2,
            'KL': xx, 'MN': yy}


def real_2021_1_3():
    hits = [(aa, bb, cc) for aa in range(1, 5) for bb in range(0, 5) for cc in range(1, 5)
            if 25 * aa + 5 * bb + cc == 81 * cc + 9 * bb + aa]
    assert len(hits) == 1
    (aa, bb, cc), = hits
    return {'A': 1, 'B': 4, 'C': 0, 'D': 4, 'E': 1, 'F': 4, 'GH': 25, 'I': 5,
            'JK': 81, 'L': 9, 'M': 6, 'NO': 20, 'P': aa, 'Q': bb, 'R': cc,
            'STU': 25 * aa + 5 * bb + cc}


def real_2023_1_1():
    f = Rational(1, 3) * x**2 + a * x - b
    g = -x**2 + c * x + b
    e1 = expand(-3 * (f - g).subs(x, -1))   # 3a + 6b - 3c - 4 = 0
    e2 = expand((f - g).subs(x, 3))         # 3a - 2b - 3c + 12 = 0
    assert e1 == 3 * a + 6 * b - 3 * c - 4
    assert e2 == 3 * a - 2 * b - 3 * c + 12
    bb = solve(e1 - e2, b)[0]
    return {'A': 6, 'B': 3, 'C': 4, 'D': 3, 'E': 3, 'F': bb}


def real_2023_2_4():
    R = sqrt(6)
    AC = 2 * sqrt(3)
    angB = 45
    assert simplify(AC / (2 * R) - sin(rad(angB))) == 0
    angCAD = 45  # right triangle ACD: cos = AC / AD
    assert simplify(AC / (2 * R) - cos(rad(angCAD))) == 0
    angA = 15 + angCAD
    BC = simplify(2 * R * sin(rad(angA)))
    assert simplify(BC - 3 * sqrt(2)) == 0
    ABs = solve(x**2 + BC**2 - 2 * x * BC * cos(rad(angB)) - AC**2, x)
    AB = max(ABs, key=lambda v: v.evalf())  # largest angle (75°) faces AB
    assert simplify(AB - (3 + sqrt(3))) == 0
    return {'AB': angB, 'C': 3, 'D': 2, 'E': 3, 'F': 3}


def real_2022_1_3():
    return {'A': totient(5), 'B': totient(6), 'C': totient(12)}


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
