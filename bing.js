// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.113
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
var default_search_words = ["“中哈关系将像金鹰展翅高飞”", "韵达快递被罚", "外交部：中国不参与军备竞赛", "游山玩水拉近中国与周边国家邻里情", "全球第2个满级QQ也来了 当事人回应", "贾玲近照曝光 没有复胖", "优衣库回应“镜子有滤镜”", "伊朗正准备大行动 目标清单曝光", "柠檬疯涨似黄金", "海量学校专业怎么选？招办主任支招", "以军对伊朗中部开始新一轮空袭", "山西一学生被光伏板砸中身亡？假", "俄媒：伊朗准备“摧毁以战争机器”", "镇政府回应安徽村民哄抢土豆", "27岁女子因丈夫长期吸烟确诊肺癌", "罗永浩评价数字人首秀：远超预期", "印度亿万富翁误吞蜜蜂身亡", "女儿实名举报交警继父私生活混乱", "刘亦菲逛街后去美容院做护理", "湖南烟花厂爆炸致1死6失联", "打虎！副部级彭晓春被查", "常州输球最大的“受害者”出现了", "部分一二线城市商品房销售额上涨", "一架波音客机长沙起飞半小时后返航", "一上高铁就睡觉是因缺氧？12306回应", "广汽埃安疑似“爆雷”", "老人去世后 散步认识的干女儿争房产", "#伊朗哈梅内伊政权会崩溃吗#", "安徽500亩土豆遭村民哄抢", "湖南爆炸花炮厂员工：趴水沟捡条命", "第55届巴黎航展今日开幕", "男孩反复发烧咳嗽确诊肺恶性肿瘤", "美驻以色列外交馆舍因伊朗袭击受损", "央视曝光电动自行车滥用远光灯", "进口九价HPV疫苗价格“大跳水”", "没有马丽就没有开心麻花团综", "以军疑自毁发射台引发巨大爆炸", "与伊以相关？30架美军机正穿越大西洋", "台网红“馆长”感叹大陆好山好水", "“苏超”9.9元球票最高被炒到600元", "巴黎航展以色列展台突遭黑布遮盖", "大爷体内藏52年牙刷称以为能溶解掉", "李梦回应缺席亚洲杯", "花炮厂爆炸涉事企业19天前刚被罚", "印度坠机视频拍摄者称再不敢坐飞机", "央美毕业展又双叒叕成热门打卡点", "酒后推车回家算酒驾吗 交警回应", "LABUBU爆火背后 黄牛一周净赚37万", "涉邯郸初中生埋尸案 最高检最新发布", "35岁男演员称辟谷7天瘦8斤", "章子怡被20年老粉感动落泪"]

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
