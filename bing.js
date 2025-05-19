// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.56
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
var default_search_words = ["博物馆的“千面新生”", "央视曝光永久基本农田竟沦为垃圾场", "陈奕迅被传去世 歌手叶晓粤：假新闻", "6组数据透视中国市场强大吸引力", "国家医保局释疑“X光检查为何变少”", "男子遇夜跑大熊猫一开始以为是猪", "拜登确诊恶性前列腺癌 癌细胞已扩散", "母子错过航班大闹机场称耽误考公", "数次地震不倒 联合国点赞中国黑科技", "病重男孩与全班拍毕业照次日离世", "茅台股东大会前夜晚宴 茅台变蓝莓汁", "新人在婚姻登记大厅打架？系摆拍", "印军方称“印巴停火没有终止日期”", "美国专家解读拜登前列腺癌病情", "戈登腿筋二级拉伤坚持出战", "雷霆4-3淘汰掘金晋级西决", "黄子韬卫生巾15分钟卖出19.5万件", "海地女子用馅饼毒杀40名黑帮分子", "德国客机“无人驾驶”飞行10分钟", "汪小菲大婚当晚 S妈连发6条帖子", "小米自研芯片玄戒O1跑分出炉", "黄杨钿甜同款耳环仿款售价不到百元", "武契奇：我受够了", "北京人犬障碍赛突发意外：参赛犬死亡", "女星高价耳环事件需澄清3个核心问题", "李宇春 初代选秀白月光", "普京明确特别军事行动四大目标", "这是一张3000年前商朝王子的请假条", "西甲联赛塞维利亚0比2皇马", "4S店销冠疑用个人收款码收钱后跑路", "曝马筱梅已怀孕 刚怀不久", "北方高温南方暴雨扩大", "沃尔玛将涨价 特朗普：怎么能怪关税", "埃及总统敦促加沙地带立即停火", "多哈世乒赛5月19日赛程公布", "女子服刑10年将出狱：父母已病逝", "西甲联赛巴萨2比3比利亚雷亚尔", "阿森纳1-0纽卡 锁定欧冠资格", "林诗栋4-0横扫晋级男单64强", "警方调查砸伤女孩高坠玻璃来源", "台评论员谈央视披露歼-10CE实战成绩", "汪顺潘展乐孙杨晋级200米自由泳决赛", "美要求伊美协议须含弃铀浓缩条款", "年轻人“炒金热”背后", "俄方批德总理淡化援乌远程武器争议", "陆虎再唱《雪落下的声音》", "直播间卖198元电动蒲扇遭吐槽智商税", "王曼昱：自己状态不错 专注后面比赛", "广东信宜北界镇一桥梁垮塌", "肖战《藏海传》首播成绩曝光", "余依婷100米蝶泳冠军"]

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
