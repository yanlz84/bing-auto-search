// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.163
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
var default_search_words = ["相知相亲 和合共生", "饭店老板随手拍菜品被罚45万", "男生考上火工大 校领导亲手递通知", "暑期出游如何“避坑”", "被运往缅甸 男子称不跳车2天挣10万", "几块钱的手机壳可能有毒或致肾衰竭", "院士预测广东8级地震？官方通报", "你的隐私正在快递单上“裸奔”", "“巧克力”大爷直播钓鱼引万人围观", "川妹子仿妆张柏芝 本人来了都怀疑", "王毅会见鲁比奥 就中美关系交换意见", "太阳能板会释放有害电磁辐射？假", "司机称青甘大环线上12条轮胎被扎", "#孙颖莎被爆冷是球台的问题吗#", "大学生暑假在家的真实现状", "陈乔恩谈不生孩子原因", "缅北白家犯罪集团21人被公诉", "山西披露：提拔带病干部 两人被处理", "湘潭大学投毒案凶手称被室友霸凌", "曝神颜女星的隐秘情史", "缅北白家涉诈案件3.1万余起", "鞠婧祎片场意外摔倒 重重磕到下巴", "清华毕业生求食堂菜谱 厨师手写秘方", "孙颖莎爆冷出局无缘8强", "董事长：奇瑞在国内打不还手骂不还口", "当地回应司机遭扎胎报废12条轮胎", "《爱情公寓》女主娄艺潇开始演短剧了", "养殖户放冰块和藿香正气水给鱼降温", "厦门小时降雨量下到全国第一", "杨少华出殡场面盛大 百辆豪车送行", "缅北白家致6名中国公民死亡", "杨少华曾吐槽儿子：他把我当驴使", "茅盾假装打麻将躲过日军抓捕", "3成大城市打工人存款超过50万", "田栩宁回应近期风波", "男子刚走过几秒后冰箱突然爆炸", "前央视主持人在杨少华灵堂前崩溃", "一斤知了价格涨到300元", "当地市监局回应随手拍视频被罚45万", "张踩铃开麦吐槽《歌手》", "专家：热射病不能大量喝冰水", "陈龙突击检查父母开空调", "陈熠回应战胜孙颖莎", "“印度客机坠毁”初步调查结果曝光", "主打治愈不费力的“窝囊游”火了", "国足出征东亚杯托运140件行李", "以袭击加沙援助物资分发点 至少10死", "中美最高级别外交官首次面对面会谈", "奶奶频繁亲吻孙子致其患亲吻病", "韩国前总统尹锡悦被捕后命运如何", "“大圣同款”泳衣卖爆了"]

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
