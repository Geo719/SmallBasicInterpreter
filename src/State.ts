﻿export interface ParseNode {
    Type: string;
    Literal: any;
    Left?: ParseNode;
    Operator?: string;
    Right?: ParseNode;
}

export interface ParseRecord {
    State: number;
    Node: ParseNode;
}

export var Columns = '+-*/().=,<>":[]\' ';
export var Operators = ['Or', 'And'];
export var Letters = '_ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export var Numbers = '0123456789';
export var Symbols = [];
export var Line = 0;
export var Keywords = [ 'For', 'To', 'Step', 'EndFor', 'If', 'Then', 'Else', 'EndIf', 'Goto', 'While', 'EndWhile', 'Sub', 'EndSub', 'ElseIf' ];
export var Stack: ParseRecord[];
export var State: number;

export var LexTable = [
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ], // 0:  Placeholder
  //[ l   d   +   -   *   /   (   )   .   =   ,   <   >   "   :   [   ]   '   sp  e   b ]
    [ 2,  4,  6,  19, 6,  6,  15, 15, 6,  6,  6,  7,  21, 10, 6,  6,  6,  12, 1,  1,  0 ], // 1:  Starting State
    [ 2,  2,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  14, 3,  3,  3,  3,  3,  0 ], // 2:  In Identifier
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 ], // 3:  End Identifier *
    [ 5,  4,  5,  5,  5,  5,  5,  5,  16, 5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0 ], // 4:  In Number
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 ], // 5:  End Number *
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0 ], // 6:  Found Operator *
    [ 9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  9,  9,  8,  9,  9,  9,  9,  9,  9,  9,  1 ], // 7:  In <
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0 ], // 8:  End Compound Operator *
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 ], // 9:  End Operator *
    [ 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 10, 10, 10, 10, 10, 10, 0 ], // 10: In String
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0 ], // 11: End String *
    [ 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 0 ], // 12: In Comment
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0 ], // 13: End Comment *
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0 ], // 14: End Label *
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0 ], // 15: Found Separator *
    [ 0,  17, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ], // 16: Found Decimal Point
    [ 18, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 0 ], // 17: In Decimal
    [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 ], // 18: End Decimal *
    [ 9,  20, 9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  0 ], // 19: In minus sign
    [ 5,  4,  5,  5,  5,  5,  5,  5,  16, 5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0 ], // 20: In Negative Number
    [ 9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  1 ]  // 21: In >
];

var parseActions = {
    'If': 0,
    'Then': 1,
    'Else': 2,
    'ElseIf': 3,
    'EndIf': 4,
    'For': 5,
    'To': 6,
    'EndFor': 7,
    'Step': 8,
    'While': 9,
    'EndWhile': 10,
    'Sub': 11,
    'EndSub': 12,
    'Goto': 13,
    'Iden': 14,
    'Lab': 15,
    'Lit': 16,
    '.': 17,
    ',': 18,
    '=': 19,
    '+': 20,
    '-': 21,
    '/': 22,
    '*': 23,
    '(': 24,
    ')': 25,
    '<': 26,
    '>': 27,
    '<>': 28,
    '>=': 29,
    '<=': 30,
    '$': 31
};

export function GetParseAction(terminal: string) {
    return ParseActions[this.State][parseActions[terminal]];
}

var ParseActions: string[][] = [
//  [ '0',  '1',  '2',  '3',  '4',  '5',  '6',  '7',  '8',  '9',  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31' ]
    [ '2',  '',   '3',  '4',  '5',  '6',  '',   '7',  '',   '8',  '9',  '10', '11', '12', '13', '65', '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   ''   ], // 0
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'acc'], // 1
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 2
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r2' ], // 3
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r3' ], // 4
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r4' ], // 5
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 6
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r6' ], // 7
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 8
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r9' ], // 9
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '23', '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   ''   ], // 10
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r11'], // 11
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '24', '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   ''   ], // 12
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '25', '',   '27', '',   '',   '',   '',   '26', '',   '',   '',   '',   '',   '',   ''   ], // 13
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r15'], // 14
    [ '',   '28', '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '51', '29', '30', '',   '',    '',   '',   '45', '64', '32', '33', '46', ''   ], // 15
    [ '',   'r23','',   '',   '',   '',   'r23','',   'r23','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r23','r23','r23','35', '34',  '',   'r23','r23','r23','r23','r23','r23','r23'], // 16
    [ '',   'r26','',   '',   '',   '',   'r26','',   'r26','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r26','r26','r26','r26','r26', '',   'r26','r26','r26','r26','r26','r26','r26'], // 17
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 18
    [ '',   'r28','',   '',   '',   '',   'r28','',   'r28','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r28','r28','r28','r28','r28', '',   'r28','r28','r28','r28','r28','r28','r28'], // 19
    [ '',   'r29','',   '',   '',   '',   'r29','',   'r29','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r29','r29','r29','r29','r29', '',   'r29','r29','r29','r29','r29','r29','r29'], // 20
    [ '',   '',   '',   '',   '',   '',   '37', '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '51', '29', '30', '',   '',    '',   '',   '45', '64', '32', '33', '46', ''   ], // 21
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '51', '29', '30', '',   '',    '',   '',   '45', '64', '32', '33', '46', 'r8' ], // 22
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r10'], // 23
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r12'], // 24
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '38', '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   ''   ], // 25
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '54', '',   '',   '',   '',   '',   ''   ], // 26
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 27
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r1' ], // 28
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 29
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 30
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 31
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r30','',   'r30','',   '',   '',   '',   '',   '',   '',   'r30','',   '',   '',   '',   '',   '',   ''   ], // 32
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r32','',   'r32','',   '',   '',   '',   '',   '',   '',   'r32','',   '',   '',   '',   '',   '',   ''   ], // 33
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 34
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 35
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '51', '29', '30', '',   '',    '',   '50', '45', '64', '32', '33', '46', ''   ], // 36
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',    '',   ''  ], // 37
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '53', '',   '',   '',   '',   '',    '',   ''  ], // 38
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   'r16','',   '',   '',   '',    '',   ''  ], // 39
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   'r16','',   '',   '',   '',    '',   ''  ], // 40
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '51', '29', '30', '',   '',    '',   '50', '45', '64', '32', '33', '46', 'r18'], // 41
    [ '',   'r19','',   '',   '',   '',   'r19','',   'r19','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r19','r19','r19','35', '34',  '',   '',   'r19','r19','r19','r19','r19','r19'], // 42
    [ '',   'r20','',   '',   '',   '',   'r20','',   'r20','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r20','r20','r20','35', '34',  '',   '',   'r20','r20','r20','r20','r20','r20'], // 43
    [ '',   'r22','',   '',   '',   '',   'r22','',   'r22','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r22','r22','r22','35', '34',  '',   '',   'r22','r22','r22','r22','r22','r22'], // 44
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r34','',   'r34','',   '',   '',   '',   '',   '',   '',   'r34','',   '',   '',   '',   '',    '',   ''  ], // 45
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r31','',   'r31','',   '',   '',   '',   '',   '',   '',   'r31','',   '',   '',   '',   '',    '',   ''  ], // 46
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',    '',   ''  ], // 47
    [ '',   'r24','',   '',   '',   '',   'r24','',   'r24','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r24','r24','r24','r24','r24', '',   '',   'r24','r24','r24','r24','r24','r24'], // 48
    [ '',   'r25','',   '',   '',   '',   'r25','',   'r25','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r25','r25','r25','r25','r25', '',   '',   'r25','r25','r25','r25','r25','r25'], // 49
    [ '',   'r27','',   '',   '',   '',   'r27','',   'r27','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r27','r27','r27','r27','r27', '',   'r27','r27','r27','r27','r27','r27','r27'], // 50
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 51
    [ '',   '',   '',   '',   '',   '',   '',   '',   '59', '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   ''   ], // 52
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '63', '',   '',   '',   '',   '',   ''   ], // 53
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r14'], // 54
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   'r16','',   '',   '',   '',   '',   ''   ], // 55
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '54', '',   '',   '',   '',   '',   ''   ], // 56
    [ '',   'r21','',   '',   '',   '',   'r21','',   'r21','',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r21','r21','r21','',   '',    '',   '',   'r21','r21','r21','r21','r21','r21'], // 57
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r5' ], // 58
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '20', '',   '19', '',   '',   '',   '',   '',   '',   '',   '18', '',   '',   '',   '',   '',   '',   ''   ], // 59
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '63', '',   '',   '',   '',   '',   ''   ], // 60
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r17'], // 61
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r7' ], // 62
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r13'], // 63
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   'r33','',   'r33','',   '',   '',   '',   '',   '',   '',   'r33','',   '',   '',   '',   '',   '',   ''   ], // 64
    [ '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',   '',    '',   '',   '',   '',   '',   '',   '',   'r35'], // 65
];

var parseGoto = {
    'E': 0,
    'R': 1,
    'T': 2,
    'F': 3,
    'G': 4,
    'A': 5,
    'B': 6,
    'S': 7,
    'C': 8
};

export function GetParseGoto(state: number, production: string) {
    return ParseGoto[state][parseGoto[production]];
}

var ParseGoto = [
//  [ E,  R,  T,  F,  G,  A,  B,  S,  C  ]
    [ 0,  0,  0,  0,  0,  0,  14, 1,  0  ], // 0
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 1
    [ 15, 0,  16, 17, 0,  0,  0,  0,  0  ], // 2
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 3
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 4
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 5
    [ 21, 0,  16, 17, 0,  0,  0,  0,  0  ], // 6
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 7
    [ 22, 0,  16, 17, 0,  0,  0,  0,  0  ], // 8
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 9
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 10
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 11
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 12
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 13
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 14
    [ 0,  0,  0,  0,  31, 0,  0,  0,  0  ], // 15
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 16
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 17
    [ 36, 0,  16, 17, 0,  0,  0,  0,  0  ], // 18
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 19
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 20
    [ 0,  0,  0,  0,  31, 0,  0,  0,  0  ], // 21
    [ 0,  0,  0,  0,  31, 0,  0,  0,  0  ], // 22
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 23
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 24
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 25
    [ 39, 0,  16, 17, 0,  39, 0,  0,  0  ], // 26
    [ 41, 0,  16, 17, 0,  0,  0,  0,  0  ], // 27
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 28
    [ 0,  0,  42, 17, 0,  0,  0,  0,  0  ], // 29
    [ 0,  0,  43, 17, 0,  0,  0,  0,  0  ], // 30
    [ 0,  0,  44, 17, 0,  0,  0,  0,  0  ], // 31
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 32
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 33
    [ 0,  0,  0,  48, 0,  0,  0,  0,  0  ], // 34
    [ 0,  0,  0,  49, 0,  0,  0,  0,  0  ], // 35
    [ 0,  0,  0,  0,  31, 0,  0,  0,  0  ], // 36
    [ 52, 0,  0,  0,  0,  0,  0,  0,  0  ], // 37
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 38
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 39
    [ 0,  0,  0,  0,  0,  0,  0,  0,  55 ], // 40
    [ 0,  0,  0,  0,  31, 0,  0,  0,  0  ], // 41
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 42
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 43
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 44
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 45
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 46
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 47
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 48
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 49
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 50
    [ 0,  0,  16, 17, 0,  0,  0,  0,  0  ], // 51
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 52
    [ 40, 0,  16, 17, 0,  60, 0,  0,  0  ], // 53
    [ 0,  58, 0,  0,  0,  0,  0,  0,  0  ], // 54
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 55
    [ 0,  0,  0,  0,  0,  61, 0,  0,  0  ], // 56
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 57
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0  ], // 58
    [ 62, 0,  16, 17, 0,  0,  0,  0,  0  ]  // 59
];