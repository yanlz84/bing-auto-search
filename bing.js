// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.40
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
var default_search_words = ["习近平为何用这句话形容中俄关系", "印巴停火", "印巴为何停火", "中国外贸进出口表现亮眼背后的底气", "退休夫妻月入1.2万负债1.2亿", "特朗普“邀功” 印方打脸", "艺人吃中国饭砸中国锅绝不容忍", "17岁到67岁 你居然不爱我了", "专家：印度打不起 巴基斯坦不想打", "邓紫棋演唱会8米的狮子开场太震撼了", "96岁李嘉诚坐轮椅看五月天演唱会", "河南一地众人下河摸金？当地回应", "没完全停火？这一夜印巴各执一词", "华为Mate 70系列销量逼近小米15系列", "印度证实印巴已同意停火", "曝小S挨个打电话恳请众星悼念大S", "普京提议恢复俄乌直接谈判", "拜仁为穆勒举行告别仪式", "中美经贸高层会谈还将继续", "印度要求封禁8000多个社媒账号", "特斯拉引入AI客服代理", "绿军大胜尼克斯总分1-2", "世界对歼10C的议论正在震撼发酵", "加州州长再就关税批评美政府", "葬礼突遇狂风暴雨 墙体倒塌致3死7伤", "牛弹琴：印巴停火背后的五大原因", "印度70%电网瘫痪 当地华人发声", "女子负债2544万申请个人破产合理吗", "巴基斯坦总理发表全国讲话", "中方绝不牺牲原则立场与美达成协议", "杨坤回应“18岁的腰”：是挺软的", "辛纳解禁复出首胜", "两客运员配合救起卧轨男子", "“科创板八条”后百单产业并购发布", "以军轰炸加沙汗尤尼斯 已致8人死亡", "正厅级梁伟深夜官宣落马", "聋哑司机偷拍大量女乘客 配低俗文字", "Labubu已经成了当代人的新佛牌", "戴格诺特：末节要掌控好每次进攻机会", "中方回应巴方“铜墙铁壁”军事行动", "石凯镜头被p掉", "李昊分享vlog：猛男养蚕第四天", "上百家钢铁企业已完成超低排放改造", "杨皓宇：进球没有秘诀就是刻苦训练", "胡静也没有放过李承铉", "司机醉蒙了：143块罚款我转红包给你", "巴基斯坦全面恢复领空开放", "王毅分别同印巴双方通电话", "意大利设计师点赞重庆无人机灯光秀", "汪苏泷亮相毛不易宁波演唱会", "谢震业认为中国百米接力男队上限高"]

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
