// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.21
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
var default_search_words = ["总书记为青年创新创造鼓动风帆", "游客挤瘫政府食堂：饭碗都不够用", "泰山陪爬小伙忙疯了也赚疯了", "五一假期哪些地方是打卡榜C位", "王蓉回应再次走红：激动得两腿发抖", "一票之差 美参院阻止特朗普关税失败", "卫健委调查肖某董某 事件根本性升级", "新娘身穿9.9米非遗婚服惊艳亮相", "价值4.1亿元画作展览时被小孩刮花", "恶婆婆专业户：坏人演多了面相会变凶", "博主给公鸡穿上芒果做的“新鞋”", "董某某外公为外籍院士米耀荣系谣言", "一文详解美乌矿产协议", "五一主线任务是抵达旷野", "金饰价格跌破1000元大关", "《流浪地球3》剧组辟谣“招募”", "女子为蹭高速免费提前半个月出发", "宫崎骏电影《幽灵公主》今日上映", "泽连斯基用15分钟说服特朗普", "夏思凝决赛场上临时退出含泪致歉", "山东50米飞艇首次试飞", "樊振东晒全国先进工作者证书", "尹锡悦遭韩国检方追加起诉", "王钰栋上演中超生涯首次梅开二度", "蒙古马被卖后独自跋涉300里跑回家", "永辉超市回应反向抹零：10倍赔偿", "多哈世乒赛国乒首轮迎战日本朝鲜", "大连飞贵阳航班备降3次耗时15小时", "“网约摩托车”在部分县城上线", "五四奖章名单有2位不能露脸的获奖者", "美方主动与中方接触背后的秘密", "中超河南队新主帅拉莫斯抵达", "白鹿一拖三“拯救”3位落水男士", "广东一小区天降洗衣机 物业回复", "美官员：美国负债33万亿美元", "副部级龙翔被撤职", "无座旅客被餐车服务员多收费", "卤鹅哥在高速口给游客投喂卤鹅", "王化回应柯洁吐槽智驾", "干部借调辅警作为个人专职司机", "特朗普计划批准恢复对乌军售", "马斯克回应特斯拉密谋换帅", "《无尽的尽头》国产黑马剧", "柯淳困到没卸妆一键入睡", "山东一景区专门撒蛤蜊给游客挖", "以方称准备对哈马斯发动决定性打击", "詹姆斯赛后再谈退役话题", "长城汽车4月汽车销量100061辆", "多家车企新能源车开始盈利", "五一凌晨3点泰山人多得走不动道", "五一不仅有远方还有家乡烟火气"]

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
