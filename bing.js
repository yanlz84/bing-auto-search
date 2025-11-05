// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.396
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
var default_search_words = ["以开放汇合作之力", "美国一飞机坠毁 附近大楼被撞", "刘思涵你的校服在非洲火了", "今年APEC会议有哪些成果", "网友买高铁靠窗座位却遇“面壁座”", "英伟达市值一夜蒸发1.4万亿元", "吴镇宇坐公交刷老年卡差点被赶下车", "台军1.2万人宁赔钱提前退伍", "福建赖氏宗亲：姓赖的都是中国人", "广东夫妻像双胞胎 网友建议查下DNA", "全运会吉祥物“大湾鸡”全网刷屏", "苏超冠军市在地图上放大3倍系谣言", "网红瑞恩宝贝患罕见病去世 年仅3岁", "感冒发烧后别做这种事！严重会猝死", "美国一特斯拉打不开车门 5人被烧死", "美股收盘：百度涨超3%", "约5万名韩菲混血儿寻找失联父亲", "曝光！违规拍摄涉密文件多人被处分", "笔试不及格仍进体检名单 官方通报", "藏3万黄金的旧电器被老伴100元卖了", "清华大学建筑学院官网师资没有翁帆", "老人火化后骨灰里多出四个钢钉", "谁让舞剑老人进的幼儿园", "武汉街头出现飞机 官方回应", "男子求见李嘉诚被拒 在大堂泼红漆", "发明固体杨枝甘露的人是天才", "机器狗开路 实兵对抗演练画面公布", "水产市场“麻醉鱼”调查", "保洁阿姨拍“土味说车”视频出圈", "网友花37.9元网购椅子收到一张图纸", "局地积雪20厘米 大雪大暴雪要来了", "深圳地铁回应小猪标识用途", "学生：拼单买过999元帝王蟹 价格良心", "市监局回应东北大米产地为广州", "中方回应阿富汗发生6.3级地震", "母亲和3岁女儿黄河边失联", "网传东莞最近离不了婚 当地回应", "纽约3岁华裔男童被撞身亡案宣判", "国安部解密朱枫等烈士档案", "多地已有扩大免费教育范围初步探索", "18岁儿子起诉父亲付抚养费被驳回", "金饰清洗多少损耗属于正常范围", "太空烧烤“滋滋冒油”馋坏全球网友", "宿舍楼下设吸烟点学生吐槽 高校回应", "美财长被问和马斯克打架揪衣领没", "四川一男童家中失踪近两月", "新加坡将对诈骗分子处以鞭刑", "直播间如何抵挡“克隆人大军”", "深圳现搓衣板状石凳 工作人员回应", "菲军方：坠毁直升机载有5名空军人员", "朱开称Kanavi只能在LPL打"]

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
