// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.14
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
var pause_time = 9; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["一道开启中马关系新的黄金50年", "美加州宣布起诉特朗普政府", "美日演习模拟攻击解放军 国防部回应", "中方回应美对华加征245%关税", "中国通缉3名美国特工 详情曝光", "国台办回应歌手Tank感谢祖国", "檀健次发言引争议", "结婚3年妻子开着宝马带孩子消失了", "余承东喊刘亦菲名字紧张到嘴瓢", "美经济增长可能陷入停滞", "中方回应暂停接收波音飞机传言", "郑州早7点半之后将禁止遛狗？假", "苹果和英伟达悬着的心怎么落下来", "余承东：安全就是最大的豪华", "专家解读美国对华关税加到245%", "牛弹琴：美国向全世界摊派“空气税”", "阿斯麦CFO：20%的全球员工在美国", "央视曝光驾考作弊手段", "男子称在荒地停车被贴罚单 官方回应", "青岛拟向35岁以下青年推低月供房贷", "四大电视厂商业绩“冰火两重天”", "特朗普听故宫三原色道理后懵了", "新媒提醒亚洲学生理性赴美留学", "罗马华侨夫妇深夜在家门口遭枪杀", "马拉多纳医生否认与其发生性关系", "高铁驶入时男子跳向车头不幸身亡", "刘强东硬刚王兴到底图什么", "国防部：穷兵黩武不会让美国再次伟大", "肥娟119元网购桶装冰激凌卖2元一杯", "阿斯麦：对美出口光刻机或面临关税", "老板拒售变味卤鸭转身躲过一劫", "布彭扎跳楼前曾要求看心理医生", "南部战区海军舰艇编队海上全训考核", "儿子工亡抚恤金引纠纷 法院调解", "陈梦晒三亚度假vlog", "公公给儿媳59克黄金当改口红包", "儿子出车祸 父亲去施救双双遇难", "金饰价格涨至1007元", "“史上最严”电池安全令明年施行", "西双版纳出租车漫天要价 官方通报", "女子被宠物猫咬伤腿部溃烂", "赵本山女儿球球称拒绝上综艺", "梅婷《我的后半生》窒息式演技引共鸣", "女教师上海街头怒怼“偷拍老法师”", "方程豹钛3上市 售价13.38万元起", "女生以为挖到超大竹笋结果被嘲笑", "金价暴涨 有回收客户临时毁约", "全国首类减脂黄瓜上市", "商务部：美对华加征245%关税毫无意义", "刑侦剧《悬镜》尺度有多大", "因记得外婆家竹林被拐30年后找到家"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
