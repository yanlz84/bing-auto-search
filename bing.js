// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.91
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
var default_search_words = ["“植”此青绿", "20名台湾要犯照片曝光 公安悬赏通缉", "热销的“踩屎感”鞋正在毁掉你的脚", "以旧换新“焕”出美好生活", "金正恩办公室罕见全景曝光", "国足vs印尼首发：王钰栋搭档张玉宁", "西安上空现大量白点状不明飞行物", "黄景瑜进车2小时逃生6秒钟", "李斌：黑蔚来的水军花费每月三五千万", "高考真题、绝密答案？千万别当真", "三亚游客身亡事件带火蛇类博主", "校园公共事务的谣言应对小技巧", "李在明首次主持会议遇冷 罕见发火", "#一人一句祝福考生#", "被毒蛇咬伤黄金救治时间约2小时", "国足今晚输印尼将直接出局", "多处吻戏借位遭质疑 热播剧发声明", "朱雀玄武敕令将第三次参加高考", "韩国将查明尹锡悦发动紧急戒严真相", "郭碧婷想和谢依霖换老公", "前妻控诉张纪中离婚转移三亿资产", "老人被五步蛇咬伤打16支血清保住脚趾", "长春95后男子买彩票中2930万元大奖", "男子玩密室对女鬼NPC摸腿搂腰", "砖厂涉嫌用智障者务工负责人被控制", "杨幂称小糯米画画挺好", "女子麦地收麦发现地里藏尖锐钢筋", "女司机要水泡奶男收费员秒懂", "朝鲜侧翻驱逐舰已被扶正", "港媒曝孙俪邓超将全家移民英国", "疑智障人员从砖厂被解救 知情人发声", "商务部回应美上调钢铝关税", "俄被炸机场现状曝光 图-95成灰烬", "首届奥林匹克主义365峰会在瑞士开幕", "鹿晗工作室发布郑重声明", "长安汽车或暂缓与东风汽车整合", "毕节一地疑山体开裂现出巨大裂痕", "刘浩存王安宇戏里戏外都好甜", "北约“波罗的海行动”军演在德启动", "徐艺洋给黄子韬打电话哭了", "三亚女游客被咬后曾咨询鉴蛇博主", "德防长：需新增5万至6万名现役士兵", "泰国女排1-3不敌比利时两连败", "《歌手》官宣范玮琪补位", "亲历者回忆云南洱源地震瞬间", "周星驰《女足》片场照曝光 疲态尽显", "吴艳妮回应争议：成绩会替我发言", "常州队三连败喜提“十三妹”称号", "中疾控：新冠疫情处于今年阶段性高位", "汪东城批Labubu黄牛是恶人", "义乌女老板卖labubu娃衣连开3家店"]

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
