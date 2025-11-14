// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.414
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
var default_search_words = ["习近平复信青年汉学家", "孙卫东奉示召见日本大使提严正交涉", "人民日报：绝不容忍高市早苗越线挑衅", "小孩哥小孩姐惊艳十五运会", "神舟二十号乘组将于今日返回", "上海一居民挖掘地下室形成数米深坑", "中国的愤怒在升级", "石破茂对高市早苗涉台言论表示反对", "波音客机坠毁致157人遇难 最新进展", "首台、最大、突破！大国重器好消息不断", "美股大跌 特斯拉跌超6%", "多个账号恶意诋毁汽车企业被处置", "洗衣店老板：羽绒服别买军绿色卡其色", "14岁男孩被误诊矮小症打了2940针", "山姆正跌落神坛", "1444.49吨！中国探明首个千吨级金矿", "男子差评饭店不上鱼：实际上了8次", "全运会今日看点：马龙将出战", "美国宣布启动“南方之矛”行动", "日本店员遭熊袭击浑身血继续做拉面", "李阳称董宇辉英语差发音怪", "日本有事就是日本有事", "试戴金手镯事件后续：顾客赔偿100元", "院士到大学交流被拍到穿着破旧布鞋", "地方国资扎堆出售房产", "“地表最难乒乓球赛”四强出炉", "教育部：计划建体育健康类学校9000所", "间谍伪装完美男友向女博士打探秘密", "辛芷蕾：东北人就是敢说敢闯有韧性", "覃海洋回应犯规：自己都笑了", "长白山“云顶天宫”即将回归", "雅思回应多场考试成绩异常", "41岁男子为自己举办“半个葬礼”", "男子地铁站大便事发地成打卡点", "李在明开会时3名官员轮流自拍", "苏醒坦言水平一般 已基本放弃写歌", "中方：将依法为各国运动员审发签证", "“大湾鸡”又热场整活了", "C罗国家队生涯首次染红", "泽连斯基：战时总统不能有任何朋友", "特朗普为内塔尼亚胡“求情”遭拒", "网上爆火的便秘果可以缓解便秘吗", "马泰之间海域沉船事件已致28人遇难", "BBC向特朗普道歉但拒付赔偿", "陈冲获北京大学“世界华文文学奖”", "台名嘴痛批高市早苗：不见棺材不掉泪", "俄外长：俄罗斯绝不可能对抗中国", "日本陆上自卫队赴美搞反无人机训练", "全运会男足为何不设成年组", "李景亮采访张伟丽", "中国军号：展示咱家船船儿我就这样"]

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
