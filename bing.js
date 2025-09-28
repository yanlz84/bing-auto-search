// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.320
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
var default_search_words = ["石榴籽，习近平为何一再强调", "事关你我 10月起一批新规即将施行", "全球首例！中国航母福建舰创纪录", "献给新疆维吾尔自治区成立70周年", "朝鲜宣布将对被判有罪人员实施大赦", "台风博罗依将带来大暴雨、特大暴雨", "航班突然提前15小时起飞 乘客傻眼", "中国发现百万年前“龙人”", "全球最大5000平方米空中捕风伞启运", "世界第一高桥花江峡谷大桥今日通车", "手机被远程控制转账 一根牙签立功了", "当地：“女子寻救命恩人”涉嫌炒作", "哈工大教授屠振密逝世", "小熊电器回应养生壶爆炸", "韩国外卖平台接入支付宝和微信支付", "WTT中国大满贯正赛首日赛程公布", "网红直播时坠机身亡：飞机突然失控", "20吨快递“葬身火海” 网友：别吓我", "央视曝光假钻戒成本仅3元", "三亚通知：全市停课", "印度南部发生踩踏事件至少36人死亡", "巴总理：巴方将7架印军战机炸成废铁", "夜爬泰山失联的李小龙遗体已找到", "“外地人一顿贵59元”！涉事餐厅停业", "东莞17亿元全额付款土地被无偿收回", "多名网友拍到沈飞战机再现低空试飞", "千禾0酱油换包装", "上海明确：这类人每年能请7天带薪假", "涉嫌严重违纪违法 欧阳可爽任上被查", "日本新首相头号热门小泉“翻车”了", "四川人3000年前就是“氪金”大佬", "原来三星堆是多彩的", "特朗普称已下令向波特兰派遣部队", "沈白高铁今日开通运营", "湖南省委书记到上海“招人”", "美国博主体验可穿戴外骨骼机器人", "国安部门破获直播泄露军事秘密案", "巴基斯坦总理联大硬刚印度", "快递员私拆包裹被开除索赔公司", "以色列民众大规模集会 要求停止战争", "76岁男子交通违法279条：不知要驾照", "美军将领下周齐聚 “秘密会议”曝光", "中央纪委要求速查顶风违纪问题", "乌外长公布无人机从匈牙利进入路线", "村民不配合灭蚊 扣减30%村集体分红", "小米17破今年国产手机首销纪录", "美国药品关税将严重打击印度仿制药", "郑钦文复出首秀现场响起《奢香夫人》", "特朗普披露国会山骚乱细节", "EP双杀EDG", "皇马2-5马竞 遭遇赛季首败"]

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
