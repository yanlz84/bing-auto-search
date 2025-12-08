// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.463
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["中共中央政治局召开会议", "课本上明太祖画像换了", "外交部回应普京对中印关系评论", "8.85亿人次受益后 医保又出实招", "日本记者街头采访找不到中国游客", "1岁多女童吊环上“开挂”", "净网：网民造谣汽车造成8杀被查处", "苟仲文受贿2.36亿余元一审被判死缓", "2分钟烧到100℃？警惕用电“雷区”", "寒潮来袭 “速冻”模式如何应对", "重庆一温泉大量女宾疑遭偷拍", "网传“深金管318号函”系伪造", "北京西城文旅局回应郭德纲被约谈", "老戏骨近60岁时得龙凤胎 被认成爷爷", "护士患癌请病假遭拒？卫健委介入调查", "原国务委员王丙乾逝世", "男子疑玩手机坠崖 事后发文福大命大", "马航MH370部分家属索赔案一审宣判", "男子开保时捷跑顺风车 偷190块电瓶", "今晚油价下调", "82岁保时捷掌门人第4次步入婚姻", "泰国总理：做好一切准备维护国家主权", "朱孝天回应缺席F4演唱会", "盒马承认生产草莓蛋糕出问题", "日方挑衅中国收割民意非常危险", "彭晓春严重违纪违法被开除党籍", "三价流感疫苗跌至5.5元比奶茶还便宜", "外交部：日方立即停止滋扰中方演训", "1178名妙瓦底涉电诈嫌犯被押解回国", "泰柬冲突升级 柬民众排长队撤离", "近3成美国人在结账时“顺手牵羊”", "“考公”培训靠谱吗", "毕井泉非法收受巨额财物被“双开”", "外交部：中美经贸不存在谁占谁的便宜", "明天可能有地磁暴 这些地方或现极光", "印尼洪灾和山体滑坡已致961人遇难", "WTT香港总决赛抽签仪式签表公布", "泡泡玛特股价大跌近9% 发生了什么", "泰柬冲突双方各执一词", "以军强行进入联合国机构办公地", "网友曝一音乐节上40余部手机丢失", "蒋万安民调大幅领先绿营候选人", "女子自驾进猛兽区被老虎咬掉车漆", "栗正杰：日本自卫队挑衅不成反被打脸", "男子幻想“一夜暴富”连续6天偷彩票", "起底“医保回流药” 涉案1300余万元", "曝美以卡三方在纽约举行秘密会谈", "12月13日悼念南京大屠杀死难者", "国内飞伦敦航班现100元“低价票”", "部分手作玩具材料可能甲醛超标", "中学教师被指当学生面踩死流浪猫"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
