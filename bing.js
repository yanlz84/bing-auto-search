// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.341
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
var default_search_words = ["文明之光照亮复兴之路", "王者荣耀崩了", "今年寒露不一般 冬天将更冷", "今天铁路预计发送旅客2175万人次", "凌晨点开92岁父亲家监控 男子慌了", "一家人掰2小时玉米后发现不是自家地", "大学生国庆8天假掰了7天半玉米", "美国驻华大使馆：没钱了 停更", "节后上班前三天不宜安排高强度工作", "小伙模仿济公爆火 是游本昌亲传弟子", "资深天使投资人肖庆平因车祸离世", "贵州金沙路边有老虎出没系谣言", "56岁陈浩民现身福建街头显沧桑", "返程高速上的车尾挂满鸡鸭大鹅", "游客景区玩滑梯时 有蛇“从天而降”", "国台办：统一必胜 “台独”必亡", "苏超淘汰赛：盐城vs无锡", "主人称狗狗下地掰玉米掰了三年了", "女子返程 妈妈在大米里藏1000元现金", "高市早苗考虑本月放弃“拜鬼”", "假期最后一天补作业仿佛鸡排哥附体", "男子喝3斤白酒用智驾行驶20公里", "鸡排哥有专属空调了", "64岁港星林俊贤在景区“打工”", "2025年诺贝尔化学奖公布", "广西遇洪涝天气 有商铺积水到2楼", "女子坐16小时火车出游突发心脏骤停", "露营遇暴雪 断联诺奖得主联系上了", "今日寒露", "商家回应芒果礼盒里有试卷", "鸡排哥已成立工作室", "诺贝尔化学奖得主来自日、澳、美3国", "“你在北方裹着袄 我在南方露着腰”", "下一次见面就是春节了", "动物园回应观光车压碎老虎下巴", "小米17系列背屏秀到联合国", "#国庆假期余额不足高速堵成长龙#", "女子悔婚退彩礼该扣3万“拥抱费”吗", "主人养鸵鸟3年长到2米高200斤", "国乒出发印度参加亚锦赛", "特斯拉精简版Model Y售价39990美元", "多人建议柯志恩找保镖保护人身安全", "台风“娜基莉”生成", "男子骑马在大理洱海与保安起冲突", "男子入住成都一酒店发现浴巾有血迹", "假期将结束家长直播孩子赶作业", "成都四年级女生斩获两项国际冠军", "全固态金属锂电池 中国有重要突破", "辽宁发生重大刑案 嫌犯穿拖鞋逃跑", "中国游客海外失联 疑似二人照片曝光", "如何破解“节后综合征”"]

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
