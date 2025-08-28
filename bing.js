// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.259
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
var default_search_words = ["天津以高水平开放促进高质量发展", "中方回应九三阅兵嘉宾无西方主要国家", "107岁抗战老兵：曾徒手掰断日军刺刀", "九三阅兵四个特点抢先看", "男子用面粉给妻子做了一束鲜花", "中方回应一些国家不愿出席九三阅兵", "成都通报“50升油箱加67.96升汽油”", "刘宪华空降贴吧狂翻牌", "哈尔滨上空现不明飞行物 悬停20分钟", "北溪爆炸所有嫌疑人身份曝光", "北京将升挂23万面国旗红旗", "武汉警方：双胞胎学生跳楼系谣言", "一顿吃200个水饺的16个外甥开学了", "胡歌老婆黄曦宁官宣二胎是儿子", "国防部回应“日本砸560亿日元公关”", "妈妈回应2岁萌娃自拍视频海外爆火", "退休外科医生做饭切肉宛如做手术", "外交部回应金正恩何时到达中国", "扫地机器人公司追觅官宣造车", "美国21岁模特在德国见义勇为被毁容", "外嫁女被拒发征地补偿 法院判了", "白头发拔一根长三根？到底能不能拔", "武汉92岁奶奶分享长寿秘籍", "美国国债猛涨 特朗普快守不住了", "湖北面积最小县 旅游收入翻了一倍多", "滴滴支付7.4亿美元和解集体诉讼", "中方要求日本加快处置日遗化武进程", "男子靠“水下推进器”偷渡至澳门", "红孩演出中间三次锦州烧烤补给", "四川特大暴雨 44148人提前转移避险", "蟹太太携手王晶吴启华入驻百度电商", "男子健身时被20kg哑铃砸中脚", "两岁男童遭灭火器直喷面部进ICU", "两架无人机高空相撞 涉事飞手均被罚", "12岁女孩半年狂花9万 妈妈急得报警", "手机直连卫星对普通人有哪些影响", "虞书欣风波事关国有资产应有通报", "大爷写的《我的母亲》已申请到版权", "多家银行宣布下调人民币存款利率", "国防部介绍大学生应征入伍优待政策", "泰勒要结婚 为啥这么多人不乐意", "22岁女孩用抗抑郁药过量中毒", "家长建议禁止学生携带电话手表上学", "科学家在6G无线通信领域取得新突破", "重大职务犯罪嫌疑人梁小菲被遣返回国", "空军航空开放活动首次静态展示歼-20", "祖孙3人误食毒蘑菇被毒倒 一人身亡", "苹果回应iPhone防晕车功能", "1岁女童住酒店误食洗手台下蟑螂药", "国防部喊话菲律宾", "2025河南卫视七夕奇妙游"]

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
