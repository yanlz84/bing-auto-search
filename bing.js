// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.317
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
var default_search_words = ["为新疆更美好的明天共同奋斗", "微信又上新功能", "天津大量螃蟹爬上马路 有人捡十斤", "未成年人网络保护国际研讨会举行", "蔡磊回应丧失语言能力：不会屈辱等死", "“局座”张召忠有新身份", "净网：“跑马机”作弊成黑产", "中方回应美在加勒比海部署军舰军队", "大爷无证驾驶一年多内违章279条", "今年上半年全国释放岗位1224万个", "“桦加沙”刚走 “博罗依”又来了", "广东两所学校因台风坍塌系谣言", "西宁动物园一雪豹逃匿 名为“闹闹”", "周末这些地方有暴雨大暴雨", "11岁男孩偷绑银行卡5天花2万", "印度空军举行仪式 退役所有米格-21", "《南京照相馆》角逐奥斯卡", "中国已有11亿人领用电子社保卡", "雨天刮风墙皮脱落 女子被砸进ICU", "青岛落马厅官张锡君贪超3亿获死缓", "租客欠房租 为何房东反赔一万八", "上海老洋房从1.5亿降至8299万仍流拍", "2岁男童因一口热汤住进ICU", "三星家族CJ会长被曝每周都秘密选妃", "好利来门店回应月饼27元一块", "男子从5588米雪山滑坠身亡 当地回应", "#景德镇鸡排哥为什么火出圈#", "蔡伟任外交部部长助理", "比利时首相：拒绝用被冻结俄资产援乌", "韩国前总统尹锡悦否认所有指控", "美媒：俄罗斯向伊朗交付米格-29战机", "商务部：对电动车实施出口许可证管理", "人社部详解如何“稳就业”", "航拍显示花莲堰塞湖坝体被切成V型", "微软“杠上”以色列国防部了吗", "特朗普回应数百美军高级将领被召回", "外交部回应麻生太郎与韩国瑜见面", "年轻人为啥拥抱“冻门”", "雷军称叫小米17是因为太强了", "曝iPhone17国内首周激活销量超百万", "尹锡悦自述理由请求保释", "三项社会保险基金累计结余9.81万亿", "老师用气球吹葫芦丝变学习素材", "易烊千玺第4次提名金鸡奖影帝", "特朗普与马斯克和好了？", "中国在北极冰区首次实现载人深潜", "逼游客购物的云南导游被吊销导游证", "强热带风暴博罗依致菲43万人被疏散", "拉夫罗夫与古特雷斯合照时互开玩笑", "雷军曝陈年10年还清10亿债务", "中国多型航空装备亮相海外"]

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
