// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.448
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
var default_search_words = ["《求是》发表习近平总书记重要文章", "多地官宣“雪假” 网友：实名制羡慕", "今起这些电动自行车全面禁售", "中国能源自主之路再添硬核底气", "安倍晋三到高市早苗：跨越10年的阴谋", "谁在买200元一粒的流感药", "神20返回舱玻璃裂纹是个三角形", "男子钓出227.2斤鱼王引围观", "女子遇反向折叠楼梯吓出一身冷汗", "老师记录甲流来袭的教室状态", "特朗普：俄乌和平协议“很可能”达成", "新疆喀什地区水利局辟谣禁止冬灌", "日本一钢铁厂发生爆炸并引发火灾", "日本官方发布高市名场面 网友：黑粉", "“地表超强材料”投产 中国传好消息", "香港火灾已致146人遇难 100人仍失联", "假奶粉何以一路畅行销往全国", "109人的“炒股群”108个“托”", "央视解读“吸毒记录可封存”", "高铁特等座面对面包间被吐槽尴尬", "今天是第38个“世界艾滋病日”", "长期没穿的衣服藏健康隐患", "25岁小伙工作中上吐下泻 下班后离世", "外卖大战半年烧掉近800亿", "极端天气已致斯里兰卡334人死亡", "英法爆发大规模游行", "神二十计划在轨处置之后无人返回", "流感进入快速上升期", "中国驻伊朗大使馆最新提醒", "狗在路中间睡觉司机鸣笛无效后辗压", "男子坚持4年义务消除地钉上千个", "他们的照片不用再打马赛克了", "男子流感后乱吃药致严重肝损伤", "韩国破获网络性犯罪大案", "南京大屠杀幸存者仅剩24人", "涉嫌腐败 以色列总理正式请求赦免", "暨南大学回应学生回宿舍要安检", "感染了HIV不等于得了艾滋病", "冷冷冷！多地将迎“跳水式”降温", "香港各界为火灾受灾居民共筑避风港", "研究发现AI已取代约12%美国劳动力", "高市早苗错误言论是对现实的误判", "券商副总裁因老鼠仓被罚没1.35亿", "机器人日租价格跳水式下跌", "日本福岛县附近海域发生4.2级地震", "空中突击不再是西方专利", "多部门回应假奶粉销往全国", "寒潮来袭 局地降温可达16℃", "中国成功发射实践二十八号卫星", "初代冰雪“一哥”压力来了", "美乌官员就“和平计划”开始谈判"]

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
