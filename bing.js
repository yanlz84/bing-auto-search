// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.350
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
var default_search_words = ["习近平总书记为“她”点赞", "巴基斯坦军方：200余人在冲突中丧生", "姚明可以领NBA养老金了", "我们离“人造太阳”有多远", "景区：趵突泉下没水泵但确有水管", "万科董事长辛杰辞职", "Windows 10即将“停服”", "本科生“回炉”上技校越来越香了", "为什么贷款骚扰电话突然变少了", "每3度电就有1度是绿电", "特朗普犹太裔女婿现身加沙", "官方辟谣越南泄洪致广西多地被淹", "牛弹琴：中国这两个邻国大打出手了", "冰箱贴已经比冰箱贵了", "浙江23岁外卖小哥蹊跷失踪22天", "美股期指集体反弹", "涉密人员窃专用装备数百件网售获刑", "猫咪在家当起了“列车员”", "大学生8天假期掰了7天半玉米", "曹德旺：我承诺捐100亿元一定算数", "小米第三款车路测谍照曝光", "巴方称要像对印度一样回应阿富汗", "河南省委书记调研 现场测玉米含水量", "3岁母狮一晚上能猎杀40只海豹", "蔡正元：美汽车工业将首遭重创", "24架F-35A隐身战机集结西太平洋", "本币互换对中国经济有何作用？", "阿富汗政府：不会将国土交给其他国家", "渭河出现2025年1号洪水", "韩占武任上被查 国家烟草专卖局表态", "17架次机舰持续位台海周边活动", "伊朗外长：伊将不会出席埃及和平峰会", "南方的冷空气快到货了", "吉祥航空安全员被指侵占乘客手机", "伊方强烈谴责以军袭击黎巴嫩", "湘超联赛变身大型相亲现场", "为什么商场里的马桶越来越多", "赖清德“独”性未变骗术升级", "泽连斯基与特朗普两天内二度通话", "台风“娜基莉”加强为台风级", "16日前后将有较强冷空气来袭", "木星伴弦月 “星月童话”即将上演", "大批民众返回加沙：废墟中清理家园", "巴基斯坦关闭与阿富汗边境口岸", "阿富汗与巴基斯坦交火 巴总理发声", "东北虎“完达山一号”再现黑龙江", "俄向伊朗传达内塔尼亚胡口信", "美国芝加哥混乱持续 冲突激烈", "西班牙一省发布最高级别暴雨警报", "《黑神话：悟空》官宣将更新", "韩国70岁以上人口首超20多岁人口"]

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
