'use strict';
// fsモジュールを変数「fs」に読み込む
const fs = require('fs');
// readlineモジュールを変数「readline」に読み込む
const readline = require('readline');
// Readstreamがゲームソフトでrsがゲーム機
const rs = fs.createReadStream('./popu-pref.csv');
// input:がゲーム機のソフトを差し込む場所
const rl = readline.createInterface({ input: rs, output: {} });
//Mapオブジェクト、Keyと同時に保持できるjsの特有の仕様（key: 都道府県 value: 集計データのオブジェクト）
const prefectureDataMap = new Map();
/*
onはゲーム機の電源を入れる、”line”」は行で読み込み、中括弧の部分まで自動ループさせる、最終行まで
読み込んだ行を無名関数のlineStringに値を引き渡し　*/
rl.on('line' ,function (lineString){

    const columns = lineString.split(',');

    const year = parseInt(columns[0]);//集計年
    const prefecture = columns[1];//都道府県名
    const popu = parseInt(columns[3]);//15〜19歳の人口

    if(year === 2010 || year === 2015){
        let value = prefectureDataMap.get(prefecture);
        if(!value){
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if(year === 2010){
            value.popu10 = popu;
        }
        if(year === 2015){
            value.popu15 = popu;
        }
        //追加の値のセットの場合、object.set(key,value)
        prefectureDataMap.set(prefecture,value);
    }
});

// ？Mapのオブジェクトはrl.on内でしか参照できないみたい？

//ストリームが終わったら処理を開始する、fsの場合はend、readlineの場合はclose
rl.on('close',function(){
/*　for-of 構文
Map や Array の中身を of の前で与えられた変数に代入して ループ処理が出来る。
let [変数名1, 変数名2] のように変数と一緒に配列を宣言することで、第一要素の key という変数にキーを、第二要素の value という変数に値を代入出来る　*/
    for(let[key,value] of prefectureDataMap){
        value.change = value.popu15 / value.popu10;
    }
    // Array.fromで連想配列を普通の配列に変換する処理をおこなう、sort関数を呼んで無名関数を呼ぶ
    const rankingArray = Array.from(prefectureDataMap).sort(function(a , b){
        // .sortの　aやbのオブジェクト[0]がkey(都道府県)[1]がvalue(人口と差異)
        // [1]value(人口と差異)の.changeプロパティ(人口と差異)を設定し、値をreturn
        return b[1].change - a[1].change;
    }　);

    const rankingStrings = rankingArray.map( function([key,value]){
        return ( key +　': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change );
    } );

    console.log(rankingStrings);
})

/*　map関数
配列内の値を操作して関数を作成して、代入する、元の配列には影響が出ない
*/

/* .sort
比較関数は 2 つの引数を受けとって、
前者の引数 a を 後者の引数 b より前にしたいときは、負の整数、
b を a より前にしたいときは、正の整数、
a と b の並びをそのままにしたいときは 0 を返す必要があります。
ここでは変化率の降順に並び替えを行いたいので、 b が a より大きかった場合、b を a より前にする必要があります。

つまり、b が a より大きいときに正の整数を返すような処理を書けば良いので、 ここでは b の変化率のプロパティから a の変化率のプロパティを引き算した値を返しています。 これにより、変化率の降順に並び替えが行われます
*/