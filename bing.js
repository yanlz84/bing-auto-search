// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.130
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
var default_search_words = ["感悟习近平在闽金融论述与实践经验", "再这样热下去 全球的早餐都“悬了”", "男生高考715分 差点挂掉北大来电", "抗战胜利80周年纪念活动这样安排", "买房烂尾法院判退房退款不还房贷", "俩好友高考查分一个626一个627", "伊朗总统：敌人阴谋彻底失败", "地震干饭小孩哥被教育了", "张若昀给自己蜡像取名“张若的”", "官方回应：退休金无需缴纳个税", "蜜雪冰城创始人晋升河南新首富", "网民编造“果树下现2尸体”被罚", "伊朗宣布作战胜利 民众疯狂庆祝", "男子殴打妻子后发生性关系被告强奸", "伊称以色列与伊朗停火进入实施阶段", "村民拍下贵州垮塌大桥事发瞬间", "#挨打的伊朗为何愿意停火#", "一个班3人高考成绩屏蔽 老师们沸腾", "港媒称姜涛跳海前疑似服药", "苏见信25岁女儿出道", "榕江最大商场被淹 老板：100万打水漂", "央美毕业生花3万体检做成毕设", "航拍：贵州榕江城区大面积被淹", "榕江最大商场被淹没 洪水如瀑布灌入", "河南2025年高考分数线公布", "中方回应“特朗普称伊以已停火”", "朱雀玄武敕令第三次高考246分", "“口头停火”成疑 以伊开“新战场”", "人民文娱评《酱园弄·悬案》", "牛弹琴：以伊闹剧让全世界目瞪口呆", "特朗普喊话以色列：别投炸弹", "张雪峰劝中低分段女生报动物医学", "古特雷斯敦促以伊全面遵守停火协议", "以伊停火后 一大关键问题仍无解", "36岁张帅2-0横扫对手晋级", "贵州榕江已紧急转移约4万人", "欧盟准备采取关税反制措施对美施压", "以方曾直接致电伊朗高官发死亡威胁", "纳斯达克中国金龙指数收涨3.31%", "广西柳江上游出现锑浓度异常", "伊朗准军事部队高级指挥官遭袭丧生", "以方称伊朗违反停火协议 将猛烈回击", "邹加怡当选亚投行下任行长", "伊朗北部城市传出爆炸声", "叙利亚首都大马士革传出爆炸声", "谷歌华人工程师杀妻监控：手拿电锯", "河南分数线 求你低一点", "以色列称停火后伊朗再射导弹", "印度外长：邻国要么合作要么付出代价", "古墓毒菌“逆袭”成为抗癌新星", "2025河北高考分数线公布"]

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
