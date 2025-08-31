// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.264
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
var default_search_words = ["习近平会见联合国秘书长古特雷斯", "俄方：普京在华停留如此久实属罕见", "六大行日赚超37亿", "上合诗篇", "日本代表最后一刻取消访美", "林书豪宣布退役", "开学了 网警来送“网络安全课”", "无人驾驶快递车被卡狂喊“救救我”", "刘强东手拿啤酒为家乡宿迁队加油", "战士从合照消失那一刻 看泪目了", "中方回应美撤销在华半导体企业授权", "重庆辟谣当地发生6.8级地震", "布鲁斯威利斯病情恶化 已与家人分居", "网友称住星级酒店全裸睡觉被开房门", "刚续保2小时就出车祸 保险公司拒赔", "胡塞武装行政机构负责人被以军打死", "刘强东带妻子观战苏超", "乌前议长遭枪杀现场视频曝光", "莫迪访日赠送石破茂月光石碗", "胡塞武装高层多人死于以军空袭", "林书豪：退役是这辈子最难的决定", "上海阿姨偶遇受伤男孩 塞给他500元", "敦煌夜市上厕所以为误闯石窟", "林书豪名场面回顾：逆天压哨三分绝杀", "高管另开公司截胡3700万订单获刑", "女子占用他人车位半小时被要求付200", "白俄罗斯总统卢卡申科抵达天津", "iPhone 17 Pro被吐槽丑", "多国领导人抵华", "男子去诊所打破伤风针却被打氯化钠", "陈雨菲淘汰安洗莹晋级世锦赛决赛", "哈马斯证实其军事领导人辛瓦尔已死", "记者兼职送外卖 1晚挣了29块", "陕西拼为Shaanxi对么 博物馆：正确", "白宫惊现豆腐渣？特朗普真气坏了", "余承东：尚界H5在“亏本卖”", "多地公布今年七夕结婚登记数据", "美军七舰压境委内瑞拉 还有核潜艇", "9月起一批涉学前教育等新规将实施", "上合峰会外国记者体验天津煎饼果子", "南方秋老虎真要被赶跑了吗", "印度总理莫迪抵达天津", "解码解放军新锐装备：东风-17、歼-20S", "湖北一汽车失控撞墙致司乘1死2伤", "好丽友回应山姆下架产品流向好特卖", "巴基斯坦总理夏巴兹乘机抵达天津", "三问高铁特等座同价不同席", "22岁小伙爱吃辛辣致肠道大出血", "丈夫不忍流浪狗分开与妻子商量收养", "钦那瓦家族三代人倒在同一对手前", "一次省级“采购” 释放重要信号"]

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
