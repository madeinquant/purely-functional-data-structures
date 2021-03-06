/*

Purely Functional Data Structures
=================================
Bottom Up Mergesort
-------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, isEmpty as isEmptyList, cons } from './List';
import { Suspension, $, leq, Comparable } from './util';

type SuspendedNestedList<T extends Comparable> = Suspension<List<List<T>>>;

export class Sortable<T extends Comparable> {
  constructor(
    public readonly size: number,
    public readonly segments: SuspendedNestedList<T>,
  ) {
    Object.freeze(this);
  }
}

const EmptySegment = <SuspendedNestedList<any>>$(() => EmptyList);

export const EmptySortable = new Sortable(0, EmptySegment);

export const isEmpty = (S: Sortable<any>) => (S.size === 0);

const mrg = <T extends Comparable>(xs: List<T>, ys: List<T>): List<T> =>
  (isEmptyList(xs) ? ys
  : (isEmptyList(ys) ? xs
  : (leq(xs.head, ys.head) ?
    cons(xs.head, mrg(xs.tail, ys))
  : cons(ys.head, mrg(xs, ys.tail)))));

const addSeg = <T extends Comparable>(seg: List<T>, segs: List<List<T>>, s: number): List<List<T>> =>
  (s % 2 === 0 ?
    cons(seg, segs)
  : addSeg(mrg(seg, segs.head), segs.tail, Math.floor(s / 2)));

export const add = <T extends Comparable>(x: T, S: Sortable<T>): Sortable<T> =>
  new Sortable(
    S.size + 1,
    $(() => addSeg(cons(x, EmptyList), S.segments.force(), S.size)));

const mergeAll = <T extends Comparable>(xs: List<T>, segs: List<List<T>>): List<T> =>
  (isEmptyList(segs) ? xs : mergeAll(mrg(xs, segs.head), segs.tail));

export const sort = <T extends Comparable>(S: Sortable<T>): List<T> =>
  mergeAll(EmptyList, S.segments.force());
